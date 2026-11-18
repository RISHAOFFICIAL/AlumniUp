// Server-side money trail transitions (Supabase live mode).
//
// The mock-mode mirror is useMockStore.transitionNeed in src/store/mock.ts.
// Both enforce the same state machine from src/lib/trail.ts and write a
// dated trail entry for every status change. API routes and the Stripe
// webhook call this helper; nothing updates needs.trail_status directly.

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  canTransition,
  eventForTransition,
  legacyStatusForTrail,
  proofDueDate,
  trailStatusForNeed,
} from "@/lib/trail";
import type { Need, TrailStatus } from "@/types";

export interface ServerTransitionInput {
  needId: string;
  to: TrailStatus;
  note?: string | null;
  actorRole?: "donor" | "school_staff" | "school_admin" | "platform_admin" | "cpf_admin" | "system";
  receivedBy?: string;
  delayedReason?: string;
  cancelledReason?: string;
  disbursementStructure?: Need["disbursement_structure"];
}

export async function transitionNeedServer(
  supabase: SupabaseClient,
  input: ServerTransitionInput
): Promise<{ ok: boolean; error?: string; need?: Need }> {
  const { data: row, error: fetchErr } = await supabase
    .from("needs")
    .select("*")
    .eq("id", input.needId)
    .single();
  if (fetchErr || !row) {
    return { ok: false, error: fetchErr?.message ?? "Need not found." };
  }

  const need = row as Need;
  const from = trailStatusForNeed(need);
  if (!canTransition(from, input.to)) {
    return { ok: false, error: `Cannot move a need from ${from} to ${input.to}.` };
  }

  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    trail_status: input.to,
    status: legacyStatusForTrail(input.to),
    updated_at: now,
  };
  if (input.to === "funded") updates.funded_at = now;
  if (input.to === "sent") {
    updates.sent_at = now;
    if (input.disbursementStructure) updates.disbursement_structure = input.disbursementStructure;
  }
  if (input.to === "received") {
    updates.received_at = now;
    updates.received_by = input.receivedBy ?? need.submitted_by_name ?? "School";
    updates.proof_due_at = proofDueDate(now);
  }
  if (input.to === "delayed") {
    updates.delayed_reason = input.delayedReason ?? null;
    updates.delay_updated_at = now;
  }
  if (input.to === "cancelled") {
    updates.cancelled_reason = input.cancelledReason ?? null;
  }
  if (from === "delayed" && input.to !== "delayed") {
    updates.delayed_reason = null;
    updates.delay_updated_at = null;
  }

  const { error: updateErr } = await supabase.from("needs").update(updates).eq("id", input.needId);
  if (updateErr) return { ok: false, error: updateErr.message };

  const { error: entryErr } = await supabase.from("trail_entries").insert({
    need_id: input.needId,
    event_type: eventForTransition(from, input.to),
    from_status: from,
    to_status: input.to,
    note: input.note ?? null,
    actor_role: input.actorRole ?? "platform_admin",
  });
  if (entryErr) {
    // The status moved but the audit row failed: log loudly; the trail is
    // the accountability record and a missing entry must be visible.
    console.error("[trail] status moved but trail entry failed", {
      needId: input.needId,
      from,
      to: input.to,
      error: entryErr.message,
    });
  }

  return { ok: true, need: { ...need, ...(updates as Partial<Need>) } };
}

// Donors of a need who should get trail emails (completed gifts with an
// email on file). Used by the trail route after receipt, delay, proof
// verification, and cancellation.
export async function donorsForNeed(
  supabase: SupabaseClient,
  needId: string
): Promise<{ donorEmail: string; donorName: string | null; amount: number; donationId: string }[]> {
  const { data, error } = await supabase
    .from("donations")
    .select("id, amount, display_name, donor_email")
    .eq("need_id", needId)
    .eq("status", "completed")
    .not("donor_email", "is", null);
  if (error || !data) return [];
  return (data as { id: string; amount: number; display_name: string | null; donor_email: string }[]).map(
    (d) => ({
      donationId: d.id,
      amount: Number(d.amount),
      donorName: d.display_name,
      donorEmail: d.donor_email,
    })
  );
}

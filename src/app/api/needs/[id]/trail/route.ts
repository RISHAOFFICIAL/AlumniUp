import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { donorsForNeed, transitionNeedServer } from "@/lib/trail-server";
import {
  notifyDonorCancellationChoice,
  notifyDonorsDelayed,
  notifyDonorsProofVerified,
  notifyDonorsReceived,
} from "@/lib/email";
import type { Need } from "@/types";

// POST /api/needs/[id]/trail — one money-trail action on a need.
// The live-mode mirror of useMockStore transitions (src/store/mock.ts).
// Every action validates against the state machine in src/lib/trail.ts,
// updates the need's dated fields, and writes a dated trail entry.
//
// Roles (live mode): the caller must be signed in. Disburse, delay,
// cancel, and proof review need platform_admin or cpf_admin. Receipt
// confirmation and proof submission need school_staff or school_admin
// for the need's own school. In mock mode the route just acknowledges
// and the client store does the work.

const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

const trailSchema = z.object({
  action: z.enum([
    "disburse",
    "receipt",
    "delay",
    "delay_update",
    "cancel",
    "proof_submit",
    "proof_verify",
    "proof_request_info",
    "extend",
  ]),
  note: z.string().trim().max(1000).nullable().optional(),
  confirmedBy: z.string().trim().max(120).optional(),
  reason: z.string().trim().max(1000).optional(),
  structure: z.enum(["single", "tranches", "direct_vendor"]).optional(),
  finalAmountSpent: z.number().min(0).max(1000000).optional(),
  invoicesNote: z.string().trim().max(2000).optional(),
  attestedBy: z.string().trim().max(120).optional(),
  reviewNotes: z.string().trim().max(2000).optional(),
});

const OPERATOR_ACTIONS = ["disburse", "delay", "delay_update", "cancel", "proof_verify", "proof_request_info", "extend"];
const SCHOOL_ACTIONS = ["receipt", "proof_submit"];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = trailSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid action." }, { status: 400 });
  }
  const data = parsed.data;

  if (USE_MOCK) {
    console.log(`[needs:trail] ${id} -> ${data.action} (mock)`);
    return NextResponse.json({ ok: true, mock: true });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured." }, { status: 503 });
  }

  // Auth: the caller must be signed in with a role allowed for this action.
  const authed = createClient();
  const {
    data: { user },
  } = await authed.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to do that." }, { status: 401 });
  }
  const { data: profile } = await supabase
    .from("users")
    .select("role, school_id")
    .eq("id", user.id)
    .single();
  const role = (profile as { role: string; school_id: string | null } | null)?.role;
  const isOperator = role === "platform_admin" || role === "cpf_admin";
  const isSchool = role === "school_staff" || role === "school_admin";
  if (OPERATOR_ACTIONS.includes(data.action) && !isOperator) {
    return NextResponse.json({ error: "This action needs an operator account." }, { status: 403 });
  }
  if (SCHOOL_ACTIONS.includes(data.action) && !isSchool && !isOperator) {
    return NextResponse.json({ error: "This action needs a school account." }, { status: 403 });
  }

  const { data: needRow, error: needErr } = await supabase
    .from("needs")
    .select("*, school:schools(name)")
    .eq("id", id)
    .single();
  if (needErr || !needRow) {
    return NextResponse.json({ error: "Need not found." }, { status: 404 });
  }
  const need = needRow as unknown as Need & {
    school: { name: string } | { name: string }[] | null;
  };
  const schoolRel = need.school;
  const schoolName = Array.isArray(schoolRel) ? schoolRel[0]?.name : schoolRel?.name ?? "the school";

  // School callers may only act on their own school's needs.
  if (isSchool && !isOperator && (profile as { school_id: string | null })?.school_id !== need.school_id) {
    return NextResponse.json({ error: "That need belongs to another school." }, { status: 403 });
  }

  const actorRole = isOperator ? (role as "platform_admin" | "cpf_admin") : "school_admin";
  const donors = await donorsForNeed(supabase, id);
  const donorInput = donors.map((d) => ({
    donorEmail: d.donorEmail,
    donorName: d.donorName,
    needTitle: need.title,
    schoolName,
    needId: id,
  }));

  switch (data.action) {
    case "disburse": {
      const structure = data.structure ?? "single";
      const result = await transitionNeedServer(supabase, {
        needId: id,
        to: "sent",
        note:
          data.note ??
          `Funds sent through Childs Play Foundation, Inc. (${structure === "direct_vendor" ? "direct vendor payment" : structure === "tranches" ? "tranches" : "single payment"}).`,
        actorRole,
        disbursementStructure: structure,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
      // Record the disbursement row for the admin/operator view.
      const gross = Number(need.raised_amount);
      await supabase.from("disbursements").insert({
        school_id: need.school_id,
        need_id: id,
        gross_amount: gross,
        school_amount: Math.round(gross * 0.88 * 100) / 100,
        alumniup_fee: Math.round(gross * 0.07 * 100) / 100,
        cpf_fee: Math.round(gross * 0.05 * 100) / 100,
        status: "processed",
        processed_at: new Date().toISOString(),
        notes: data.note ?? null,
      });
      return NextResponse.json({ ok: true });
    }

    case "receipt": {
      const confirmedBy = data.confirmedBy ?? need.submitted_by_name ?? "School";
      const received = await transitionNeedServer(supabase, {
        needId: id,
        to: "received",
        note: `Confirmed by ${confirmedBy}. Proof of use due in 30 days.`,
        actorRole: "school_admin",
        receivedBy: confirmedBy,
      });
      if (!received.ok) return NextResponse.json({ error: received.error }, { status: 409 });
      // Receipt opens the proof window.
      await transitionNeedServer(supabase, {
        needId: id,
        to: "awaiting_proof",
        note: "Proof of use is due within 30 days of receipt.",
        actorRole: "system",
      });
      await notifyDonorsReceived(donorInput, new Date().toISOString());
      return NextResponse.json({ ok: true });
    }

    case "delay": {
      if (!data.reason) {
        return NextResponse.json({ error: "A delay needs a public reason." }, { status: 400 });
      }
      const result = await transitionNeedServer(supabase, {
        needId: id,
        to: "delayed",
        note: data.reason,
        actorRole,
        delayedReason: data.reason,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
      await notifyDonorsDelayed(donorInput, data.reason);
      return NextResponse.json({ ok: true });
    }

    case "delay_update": {
      if (!data.reason) {
        return NextResponse.json({ error: "Enter the updated reason." }, { status: 400 });
      }
      const { error } = await supabase
        .from("needs")
        .update({ delayed_reason: data.reason, delay_updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      await supabase.from("trail_entries").insert({
        need_id: id,
        event_type: "delay_updated",
        from_status: "delayed",
        to_status: "delayed",
        note: data.reason,
        actor_role: actorRole,
      });
      return NextResponse.json({ ok: true });
    }

    case "cancel": {
      if (!data.reason) {
        return NextResponse.json({ error: "A cancellation needs a public reason." }, { status: 400 });
      }
      const result = await transitionNeedServer(supabase, {
        needId: id,
        to: "cancelled",
        note: `${data.reason} Donors choose a refund or a redirect.`,
        actorRole,
        cancelledReason: data.reason,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
      // Every donor gets the refund-or-redirect choice by email.
      await Promise.all(
        donors.map((d) =>
          notifyDonorCancellationChoice({
            donorEmail: d.donorEmail,
            donorName: d.donorName,
            needTitle: need.title,
            schoolName,
            needId: id,
            amount: d.amount,
            reason: data.reason as string,
          })
        )
      );
      return NextResponse.json({ ok: true });
    }

    case "proof_submit": {
      if (data.finalAmountSpent == null || !data.attestedBy) {
        return NextResponse.json(
          { error: "Proof of use needs the final amount spent and an attestation." },
          { status: 400 }
        );
      }
      // One live packet per need: update the existing packet if there is one,
      // otherwise insert a fresh one.
      const { data: existingPacket } = await supabase
        .from("proof_packets")
        .select("id")
        .eq("need_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const packetRow = {
        need_id: id,
        final_amount_spent: data.finalAmountSpent,
        invoices_note: data.invoicesNote ?? null,
        attested_by: data.attestedBy,
        attested_at: new Date().toISOString(),
        status: "submitted",
      };
      const { error: packetErr } = existingPacket
        ? await supabase.from("proof_packets").update(packetRow).eq("id", existingPacket.id)
        : await supabase.from("proof_packets").insert(packetRow);
      if (packetErr) return NextResponse.json({ error: packetErr.message }, { status: 500 });
      const result = await transitionNeedServer(supabase, {
        needId: id,
        to: "awaiting_proof",
        note: `Proof of use filed: $${data.finalAmountSpent.toLocaleString()} spent. Attested by ${data.attestedBy}.`,
        actorRole: "school_staff",
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
      return NextResponse.json({ ok: true });
    }

    case "proof_verify": {
      const { error: packetErr } = await supabase
        .from("proof_packets")
        .update({ status: "verified", review_notes: data.reviewNotes ?? null })
        .eq("need_id", id);
      if (packetErr) return NextResponse.json({ error: packetErr.message }, { status: 500 });
      const result = await transitionNeedServer(supabase, {
        needId: id,
        to: "use_verified",
        note: data.reviewNotes ?? "Fiscal sponsor verified the funds were spent as stated.",
        actorRole: "cpf_admin",
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
      const { data: packet } = await supabase
        .from("proof_packets")
        .select("final_amount_spent")
        .eq("need_id", id)
        .single();
      await notifyDonorsProofVerified(
        donorInput,
        (packet as { final_amount_spent: number | null } | null)?.final_amount_spent ?? null
      );
      return NextResponse.json({ ok: true });
    }

    case "proof_request_info": {
      if (!data.reviewNotes) {
        return NextResponse.json({ error: "Say what is missing." }, { status: 400 });
      }
      await supabase
        .from("proof_packets")
        .update({ status: "needs_more_info", review_notes: data.reviewNotes })
        .eq("need_id", id);
      await supabase.from("trail_entries").insert({
        need_id: id,
        event_type: "proof_requested",
        from_status: need.trail_status,
        to_status: need.trail_status,
        note: data.reviewNotes,
        actor_role: actorRole,
      });
      return NextResponse.json({ ok: true });
    }

    case "extend": {
      const result = await transitionNeedServer(supabase, {
        needId: id,
        to: "live",
        note: data.note ?? "Deadline extended by the school and administrator.",
        actorRole,
      });
      if (!result.ok) return NextResponse.json({ error: result.error }, { status: 409 });
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
}

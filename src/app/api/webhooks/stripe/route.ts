import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { sendDonationReceipt } from "@/lib/email";
import { transitionNeedServer } from "@/lib/trail-server";
import { trailStatusForNeed } from "@/lib/trail";
import type { Need } from "@/types";

// POST /api/webhooks/stripe — Stripe webhook receiver.
//
// Verifies the signature with STRIPE_WEBHOOK_SECRET (whsec_... from
// `stripe listen` or Dashboard -> Developers -> Webhooks). Test mode first.
//
// Events handled:
// - checkout.session.completed (one-time): record the donation, send the
//   tax receipt, add the Wall of Honor entry, and move the need to FUNDED
//   when the goal is reached.
// - invoice.payment_succeeded (monthly): record each monthly gift + receipt.
// - charge.refunded: mark the donation refunded.
// - customer.subscription.deleted: log; past gifts are unaffected.
//
// Idempotency: donations are keyed by stripe_payment_intent_id (one-time)
// and by checkout session id, so a redelivered event never double-counts.
// The sync_need_progress trigger in schema.sql keeps need totals in step.

export const runtime = "nodejs";

interface SessionMeta {
  need_id?: string;
  is_anonymous?: string;
  is_recurring?: string;
  display_name?: string;
  message?: string;
  donor_email?: string;
  user_id?: string;
}

async function recordCompletedDonation(opts: {
  needId: string;
  amount: number;
  isAnonymous: boolean;
  isRecurring: boolean;
  displayName: string | null;
  message: string | null;
  donorEmail: string | null;
  userId: string | null;
  paymentIntentId: string | null;
  checkoutSessionId: string | null;
  subscriptionId: string | null;
}): Promise<{ recorded: boolean; alreadyExisted: boolean }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.log("[webhook:stripe] Supabase not configured; gift not recorded", {
      needId: opts.needId,
      amount: opts.amount,
      paymentIntentId: opts.paymentIntentId,
    });
    return { recorded: false, alreadyExisted: false };
  }

  // Idempotency: skip if this payment was already recorded.
  if (opts.paymentIntentId) {
    const { data: existing } = await supabase
      .from("donations")
      .select("id")
      .eq("stripe_payment_intent_id", opts.paymentIntentId)
      .maybeSingle();
    if (existing) return { recorded: false, alreadyExisted: true };
  }
  if (opts.checkoutSessionId) {
    const { data: existing } = await supabase
      .from("donations")
      .select("id")
      .eq("stripe_checkout_session_id", opts.checkoutSessionId)
      .maybeSingle();
    if (existing) return { recorded: false, alreadyExisted: true };
  }

  const { data: donation, error } = await supabase
    .from("donations")
    .insert({
      need_id: opts.needId,
      user_id: opts.userId,
      amount: opts.amount,
      is_anonymous: opts.isAnonymous,
      display_name: opts.isAnonymous ? null : opts.displayName,
      message: opts.isAnonymous ? null : opts.message,
      donor_email: opts.donorEmail,
      stripe_payment_intent_id: opts.paymentIntentId,
      stripe_checkout_session_id: opts.checkoutSessionId,
      stripe_subscription_id: opts.subscriptionId,
      is_recurring: opts.isRecurring,
      status: "completed",
      tax_receipt_sent: false,
    })
    .select("id")
    .single();
  if (error || !donation) {
    console.error("[webhook:stripe] donation insert failed", error?.message);
    return { recorded: false, alreadyExisted: false };
  }

  // Wall of Honor entry for non-anonymous gifts.
  if (!opts.isAnonymous) {
    await supabase.from("wall_of_honor").insert({
      donation_id: donation.id,
      display_name: opts.displayName,
      graduation_year: null,
      message: opts.message,
      amount_display: opts.amount,
    });
  }

  // Tax receipt by email, naming the fiscal sponsor and EIN.
  if (opts.donorEmail) {
    const { data: need } = await supabase
      .from("needs")
      .select("title, school:schools(name)")
      .eq("id", opts.needId)
      .single();
    const needTitle = (need as { title: string } | null)?.title ?? "A Detroit school need";
    const schoolRel = (need as unknown as { school: { name: string } | { name: string }[] | null } | null)?.school;
    const schoolName = Array.isArray(schoolRel) ? schoolRel[0]?.name : schoolRel?.name ?? "a Detroit school";
    const sent = await sendDonationReceipt({
      donorName: opts.displayName,
      donorEmail: opts.donorEmail,
      amount: opts.amount,
      isRecurring: opts.isRecurring,
      needTitle,
      schoolName,
      date: new Date().toISOString(),
      reference: opts.paymentIntentId ?? opts.checkoutSessionId ?? donation.id,
    });
    if (sent.sent) {
      await supabase.from("donations").update({ tax_receipt_sent: true }).eq("id", donation.id);
    }
  }

  // Goal reached? Move the need LIVE -> FUNDED with a dated trail entry.
  const { data: needRow } = await supabase
    .from("needs")
    .select("*")
    .eq("id", opts.needId)
    .single();
  if (needRow) {
    const need = needRow as Need;
    if (
      trailStatusForNeed(need) === "live" &&
      Number(need.raised_amount) >= Number(need.goal_amount)
    ) {
      await transitionNeedServer(supabase, {
        needId: opts.needId,
        to: "funded",
        note: `Goal of $${Number(need.goal_amount).toLocaleString()} reached.`,
        actorRole: "system",
      });
    }
  }

  return { recorded: true, alreadyExisted: false };
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 501 }
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook:stripe] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = (session.metadata ?? {}) as SessionMeta;
        // Subscription checkouts record their gift on invoice.payment_succeeded
        // (which carries the subscription id); recording here too would double it.
        if (session.mode === "subscription") break;
        if (!meta.need_id || session.amount_total == null) break;
        await recordCompletedDonation({
          needId: meta.need_id,
          amount: session.amount_total / 100,
          isAnonymous: meta.is_anonymous === "true",
          isRecurring: false,
          displayName: meta.display_name ?? null,
          message: meta.message ?? null,
          donorEmail: meta.donor_email ?? session.customer_details?.email ?? null,
          userId: meta.user_id ?? null,
          paymentIntentId:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          checkoutSessionId: session.id,
          subscriptionId: null,
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const meta = (invoice.metadata ?? {}) as SessionMeta;
        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : null;
        // Only subscription invoices carry the need metadata we set.
        if (!meta.need_id || !subscriptionId) break;
        const paymentIntentId =
          typeof invoice.payment_intent === "string" ? invoice.payment_intent : null;
        await recordCompletedDonation({
          needId: meta.need_id,
          amount: (invoice.amount_paid ?? 0) / 100,
          isAnonymous: meta.is_anonymous === "true",
          isRecurring: true,
          displayName: meta.display_name ?? null,
          message: meta.message ?? null,
          donorEmail: meta.donor_email ?? invoice.customer_email ?? null,
          userId: meta.user_id ?? null,
          paymentIntentId,
          checkoutSessionId: null,
          subscriptionId,
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId =
          typeof charge.payment_intent === "string" ? charge.payment_intent : null;
        if (!paymentIntentId) break;
        const supabase = getSupabaseAdmin();
        if (supabase) {
          await supabase
            .from("donations")
            .update({ status: "refunded" })
            .eq("stripe_payment_intent_id", paymentIntentId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log("[webhook:stripe] subscription cancelled", { id: sub.id });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[webhook:stripe] handler failed", { type: event.type, err });
    // Return 500 so Stripe retries; the idempotency checks make a retry safe.
    return NextResponse.json({ error: "Handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

/**
 * Checkout endpoint (legacy path, kept for the future native app).
 * Creates a Stripe hosted Checkout session and returns its URL; the
 * caller redirects the donor to Stripe. New web code calls /api/checkout
 * directly. The gift is recorded by the webhook, never here.
 */
const donationSchema = z.object({
  needId: z.string().uuid("A valid need is required."),
  amount: z.coerce.number().min(1, "Donations start at $1.").max(100000),
  isRecurring: z.boolean().default(false),
  isAnonymous: z.boolean().default(false),
  displayName: z.string().trim().max(120).nullable().optional(),
  email: z.string().trim().email("Enter a valid email for your tax receipt.").max(254),
  message: z.string().trim().max(500).nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = donationSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Please check your donation.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const data = parsed.data;

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Checkout is not configured yet." },
      { status: 501 }
    );
  }

  let needTitle: string | undefined;
  let schoolName: string | undefined;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: need, error } = await supabase
      .from("needs")
      .select("title, trail_status, status, school:schools(name)")
      .eq("id", data.needId)
      .single();
    if (error || !need) {
      return NextResponse.json({ error: "That need could not be found." }, { status: 404 });
    }
    const trail = (need as { trail_status: string | null }).trail_status;
    const status = (need as { status: string }).status;
    const accepting = trail ? trail === "live" : status === "active";
    if (!accepting) {
      return NextResponse.json(
        { error: "This need is no longer accepting donations." },
        { status: 409 }
      );
    }
    needTitle = (need as { title: string }).title;
    const schoolRel = (need as unknown as { school: { name: string } | { name: string }[] | null }).school;
    schoolName = Array.isArray(schoolRel) ? schoolRel[0]?.name : schoolRel?.name;
  }

  try {
    const { url, sessionId } = await createCheckoutSession({
      ...data,
      needTitle,
      schoolName,
    });
    if (!url) {
      return NextResponse.json({ error: "Checkout could not start. Please try again." }, { status: 500 });
    }
    return NextResponse.json({ success: true, url, sessionId });
  } catch (err) {
    console.error("[donations] Stripe error", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed." },
      { status: 500 }
    );
  }
}

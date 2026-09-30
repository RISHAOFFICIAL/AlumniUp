import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { notifySponsorInquiry } from "@/lib/email";

const schema = z.object({
  company: z.string().trim().min(2, "Company name is required.").max(200),
  contact: z.string().trim().min(2, "Contact name is required.").max(120),
  email: z.string().trim().email("Enter a valid email.").max(254),
  tier: z.enum(["gold", "silver", "bronze"]),
  message: z.string().trim().max(2000).default(""),
  website: z.string().trim().max(100).default(""), // honeypot
});

// Same mock/supabase toggle as src/hooks/index.ts.
const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Silently succeed without persisting.
  const raw = body as Record<string, unknown>;
  if (raw.website) {
    return NextResponse.json({ ok: true });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Please check your submission.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const data = parsed.data;

  if (!USE_MOCK) {
    // Supabase mode: persist a pending sponsor via the service-role client.
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // Never silently drop a submission — surface a storage error instead.
      return NextResponse.json(
        { error: "Storage is not configured. Please try again later." },
        { status: 503 }
      );
    }
    const { error } = await supabase.from("sponsors").insert({
      organization_name: data.company,
      contact_name: data.contact,
      contact_email: data.email,
      tier: data.tier,
      status: "pending",
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    await notifySponsorInquiry(data);
    return NextResponse.json({ ok: true });
  }

  // Mock mode: log and return success.
  console.log(
    `[sponsors:inquire] ${data.company} | ${data.contact} | ${data.email} | tier=${data.tier}`
  );
  await notifySponsorInquiry(data);
  return NextResponse.json({ ok: true, mock: true });
}

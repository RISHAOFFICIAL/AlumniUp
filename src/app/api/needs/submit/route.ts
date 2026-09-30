import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { notifyNeedSubmission } from "@/lib/email";
import { CATEGORIES } from "@/types";

// Same mock/supabase toggle as src/hooks/index.ts.
const USE_MOCK = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

// Optional minimum amount: accept a number or an empty string; empty -> null.
const numberOrNull = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
  z.number().min(0).max(1000000).nullable()
);

const needSchema = z.object({
  schoolId: z.string().uuid("Select a school."),
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(200),
  description: z.string().trim().min(20, "Description must be at least 20 characters.").max(2000),
  category: z.enum(CATEGORIES),
  urgency: z.enum(["high", "med", "low"]),
  goalAmount: z.coerce.number().positive("Goal amount must be greater than 0.").max(1000000),
  minimumAmount: numberOrNull,
  submittedByName: z.string().trim().min(2, "Your name is required.").max(120),
  submittedByTitle: z.string().trim().max(120).default(""),
  submittedByEmail: z.string().trim().email("Enter a valid work email.").max(254),
  submittedByPhone: z.string().trim().max(30).default(""),
  photoData: z.string().max(10000000).nullable().optional(), // base64 data URL
  attestStaff: z.boolean().refine((v) => v === true, "You must confirm you are a staff member."),
  attestNoStudentInfo: z
    .boolean()
    .refine((v) => v === true, "You must confirm no student names or images are included."),
  website: z.string().trim().max(100).default(""), // honeypot
});

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

  const parsed = needSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Please check your submission.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const data = parsed.data;

  if (!USE_MOCK) {
    // Supabase mode: upload optional photo, then insert a pending need.
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: "Storage is not configured. Please try again later." },
        { status: 503 }
      );
    }

    let photoUrl: string | null = null;
    if (data.photoData) {
      const match = data.photoData.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const b64 = match[2];
        const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
        const buffer = Buffer.from(b64, "base64");
        const path = `need-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("need-photos")
          .upload(path, buffer, { contentType: mime, upsert: false });
        if (!upErr) {
          const { data: urlData } = supabase.storage.from("need-photos").getPublicUrl(path);
          photoUrl = urlData?.publicUrl ?? null;
        }
      }
    }

    const { error } = await supabase.from("needs").insert({
      school_id: data.schoolId,
      title: data.title,
      description: data.description,
      category: data.category,
      urgency: data.urgency,
      goal_amount: data.goalAmount,
      minimum_amount: data.minimumAmount,
      submitted_by_name: data.submittedByName,
      submitted_by_email: data.submittedByEmail,
      submitted_by_title: data.submittedByTitle || null,
      submitted_by_phone: data.submittedByPhone || null,
      photo_url: photoUrl,
      status: "pending",
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await notifyNeedSubmission({
      schoolId: data.schoolId,
      title: data.title,
      category: data.category,
      goalAmount: data.goalAmount,
      submittedByName: data.submittedByName,
      submittedByEmail: data.submittedByEmail,
    });
    return NextResponse.json({ ok: true });
  }

  // Mock mode: log and return success (photo is preview-only on the client).
  console.log(
    `[needs:submit] ${data.title} | ${data.submittedByName} (${data.submittedByEmail}) | ${data.category} | goal=${data.goalAmount} | status=pending`
  );
  await notifyNeedSubmission({
    schoolId: data.schoolId,
    title: data.title,
    category: data.category,
    goalAmount: data.goalAmount,
    submittedByName: data.submittedByName,
    submittedByEmail: data.submittedByEmail,
  });
  return NextResponse.json({ ok: true, mock: true });
}

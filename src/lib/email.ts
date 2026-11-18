// Email notifications via Resend (primary provider).
//
// When RESEND_API_KEY is set, mail sends for real. Without it (mock mode,
// local dev), every send logs to the server console and returns
// { sent: false } so form flows still work without credentials. Callers
// must never fail a request because email failed: sending is best-effort
// and every helper catches its own errors.
//
// Templates live in ./templates.ts. The tax receipt names Childs Play
// Foundation, Inc. and EIN 86-2707543 (Stage 2 story 5).

import { Resend } from "resend";
import { CONTACT } from "@/types";
import {
  cancellationChoice,
  donationReceipt,
  needApproved,
  needDelayed,
  needReceived,
  needRejected,
  needSubmissionConfirmation,
  proofVerified,
  schoolRegistrationConfirmation,
  sponsorInquiryConfirmation,
  type EmailTemplate,
} from "./email/templates";

const EMAIL_FROM = process.env.EMAIL_FROM ?? `AlumniUp <noreply@alumniupdetroit.org>`;

let resend: Resend | null | undefined;

function getResend(): Resend | null {
  if (resend !== undefined) return resend;
  const key = process.env.RESEND_API_KEY;
  resend = key ? new Resend(key) : null;
  return resend;
}

export async function sendEmail(to: string, template: EmailTemplate): Promise<{ sent: boolean }> {
  const client = getResend();
  if (!client) {
    console.log(`[email:mock] to=${to} subject=${template.subject}`);
    return { sent: false };
  }
  try {
    const { error } = await client.emails.send({
      from: EMAIL_FROM,
      to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
    if (error) {
      console.error("[email:resend] send failed", error);
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email:resend] send threw", err);
    return { sent: false };
  }
}

export interface SchoolRegistration {
  schoolName: string;
  contactName: string;
  role: string;
  workEmail: string;
  phone?: string;
  message?: string;
}

export interface SponsorInquiry {
  company: string;
  contact: string;
  email: string;
  tier: "gold" | "silver" | "bronze";
  message?: string;
}

export interface NeedSubmission {
  schoolId: string;
  title: string;
  category: string;
  goalAmount: number;
  submittedByName: string;
  submittedByEmail: string;
}

export async function notifySchoolRegistration(data: SchoolRegistration): Promise<void> {
  await sendEmail(
    data.workEmail,
    schoolRegistrationConfirmation({ schoolName: data.schoolName, contactName: data.contactName })
  );
  // Internal alert to the schools inbox.
  await sendEmail(CONTACT.schools, {
    subject: `New school registration: ${data.schoolName}`,
    html: `<p>${data.contactName} (${data.role}) registered ${data.schoolName}. Work email: ${data.workEmail}.${data.phone ? ` Phone: ${data.phone}.` : ""}${data.message ? ` Message: ${data.message}` : ""}</p>`,
    text: `${data.contactName} (${data.role}) registered ${data.schoolName}. Work email: ${data.workEmail}.${data.phone ? ` Phone: ${data.phone}.` : ""}${data.message ? ` Message: ${data.message}` : ""}`,
  });
}

export async function notifySponsorInquiry(data: SponsorInquiry): Promise<void> {
  await sendEmail(
    data.email,
    sponsorInquiryConfirmation({ company: data.company, contact: data.contact, tier: data.tier })
  );
  await sendEmail(CONTACT.sponsors, {
    subject: `New ${data.tier} sponsor inquiry: ${data.company}`,
    html: `<p>${data.contact} (${data.email}) inquired about the ${data.tier} tier for ${data.company}.${data.message ? ` Message: ${data.message}` : ""}</p>`,
    text: `${data.contact} (${data.email}) inquired about the ${data.tier} tier for ${data.company}.${data.message ? ` Message: ${data.message}` : ""}`,
  });
}

export async function notifyNeedSubmission(data: NeedSubmission): Promise<void> {
  await sendEmail(
    data.submittedByEmail,
    needSubmissionConfirmation({ needTitle: data.title, posterName: data.submittedByName })
  );
  await sendEmail(CONTACT.hello, {
    subject: `New need awaiting approval: ${data.title}`,
    html: `<p>${data.submittedByName} submitted "${data.title}" (${data.category}, goal $${data.goalAmount.toLocaleString()}). Review it in the admin queue.</p>`,
    text: `${data.submittedByName} submitted "${data.title}" (${data.category}, goal $${data.goalAmount.toLocaleString()}). Review it in the admin queue.`,
  });
}

// ─────────────────────────────────────────────────────────────
// Donation receipt + trail notifications
// ─────────────────────────────────────────────────────────────

export interface ReceiptInput {
  donorName: string | null;
  donorEmail: string;
  amount: number;
  isRecurring: boolean;
  needTitle: string;
  schoolName: string;
  date: string;
  reference: string;
}

export async function sendDonationReceipt(input: ReceiptInput): Promise<{ sent: boolean }> {
  return sendEmail(input.donorEmail, donationReceipt(input));
}

export async function notifyNeedApproved(to: string, opts: { needTitle: string; needId: string; posterName: string }) {
  await sendEmail(to, needApproved(opts));
}

export async function notifyNeedRejected(to: string, opts: { needTitle: string; posterName: string; reason: string }) {
  await sendEmail(to, needRejected(opts));
}

export interface DonorNotifyInput {
  donorEmail: string;
  donorName: string | null;
  needTitle: string;
  schoolName: string;
  needId: string;
}

export async function notifyDonorsReceived(donors: DonorNotifyInput[], receivedDate: string) {
  await Promise.all(
    donors.map((d) =>
      sendEmail(d.donorEmail, needReceived({ ...d, receivedDate }))
    )
  );
}

export async function notifyDonorsDelayed(donors: DonorNotifyInput[], reason: string) {
  await Promise.all(
    donors.map((d) => sendEmail(d.donorEmail, needDelayed({ ...d, reason })))
  );
}

export async function notifyDonorsProofVerified(
  donors: DonorNotifyInput[],
  finalAmountSpent: number | null
) {
  await Promise.all(
    donors.map((d) =>
      sendEmail(d.donorEmail, proofVerified({ ...d, finalAmountSpent }))
    )
  );
}

export async function notifyDonorCancellationChoice(
  donor: DonorNotifyInput & { amount: number; reason: string }
) {
  await sendEmail(donor.donorEmail, cancellationChoice(donor));
}

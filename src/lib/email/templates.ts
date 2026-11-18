// Email templates for AlumniUp. Plain language, no em dashes.
// Every template is written as HTML + plain text. The tax receipt names
// the fiscal sponsor and EIN, as required by Stage 2 story 5.

import { CPF_INFO, CONTACT, SITE_URL } from "@/types";

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#F8F7F5;font-family:Arial,Helvetica,sans-serif;color:#0F1F38;">
<div style="max-width:560px;margin:0 auto;padding:24px;">
<div style="background:#0F1F38;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0;">
<p style="margin:0;font-size:22px;font-weight:bold;">Alumni<span style="color:#D4A84E;">Up</span></p>
</div>
<div style="background:#fff;padding:24px;border:1px solid #E0DBD2;border-top:none;border-radius:0 0 12px 12px;">
<h1 style="margin:0 0 16px;font-size:22px;">${title}</h1>
${bodyHtml}
<p style="font-size:12px;color:#666;margin-top:24px;border-top:1px solid #E0DBD2;padding-top:16px;">
AlumniUp · Detroit, MI · <a href="mailto:${CONTACT.support}">${CONTACT.support}</a><br>
Donations are tax-deductible through ${CPF_INFO.name}, a ${CPF_INFO.classification} organization (EIN ${CPF_INFO.ein}).
</p>
</div></div></body></html>`;
}

function money(n: number): string {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateLine(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────
// Tax receipt (Stage 2 story 5: arrives within minutes, includes
// sponsor name, EIN, amount, and date)
// ─────────────────────────────────────────────────────────────
export function donationReceipt(opts: {
  donorName: string | null;
  donorEmail: string;
  amount: number;
  isRecurring: boolean;
  needTitle: string;
  schoolName: string;
  date: string;
  reference: string;
}): EmailTemplate {
  const subject = `Your tax receipt: ${money(opts.amount)} to ${opts.schoolName}`;
  const greeting = opts.donorName ? `Dear ${opts.donorName},` : "Dear donor,";
  const bodyHtml = `
<p>${greeting}</p>
<p>Thank you for your ${opts.isRecurring ? "monthly " : ""}gift of <strong>${money(opts.amount)}</strong> to <strong>${opts.needTitle}</strong> at ${opts.schoolName}.</p>
<p>This email is your official tax receipt. Keep it for your records.</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">Recipient</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;"><strong>${CPF_INFO.name}</strong></td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">Tax status</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${CPF_INFO.classification} organization</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">EIN</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${CPF_INFO.ein}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">Amount</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;"><strong>${money(opts.amount)}</strong>${opts.isRecurring ? " / month" : ""}</td></tr>
<tr><td style="padding:8px 0;border-bottom:1px solid #eee;">Date</td><td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${dateLine(opts.date)}</td></tr>
<tr><td style="padding:8px 0;">Reference</td><td style="padding:8px 0;text-align:right;">${opts.reference}</td></tr>
</table>
<p>No goods or services were provided in exchange for this gift. Your gift is tax-deductible to the extent allowed by law.</p>
<p>You can follow this gift in public until the school confirms it arrived. Visit your gift history any time: <a href="${SITE_URL}/my-donations">${SITE_URL}/my-donations</a></p>
<p>With gratitude,<br>The AlumniUp Team</p>`;
  const text = `${greeting}

Thank you for your ${opts.isRecurring ? "monthly " : ""}gift of ${money(opts.amount)} to "${opts.needTitle}" at ${opts.schoolName}.

This email is your official tax receipt. Keep it for your records.

Recipient: ${CPF_INFO.name}
Tax status: ${CPF_INFO.classification} organization
EIN: ${CPF_INFO.ein}
Amount: ${money(opts.amount)}${opts.isRecurring ? " / month" : ""}
Date: ${dateLine(opts.date)}
Reference: ${opts.reference}

No goods or services were provided in exchange for this gift. Your gift is tax-deductible to the extent allowed by law.

Follow your gift in public: ${SITE_URL}/my-donations

With gratitude,
The AlumniUp Team`;
  return { subject, html: shell("Your tax receipt", bodyHtml), text };
}

// ─────────────────────────────────────────────────────────────
// Trail notifications
// ─────────────────────────────────────────────────────────────
export function needReceived(opts: {
  donorName: string | null;
  needTitle: string;
  schoolName: string;
  needId: string;
  receivedDate: string;
}): EmailTemplate {
  const subject = `Good news: ${opts.schoolName} received your gift`;
  const greeting = opts.donorName ? `Dear ${opts.donorName},` : "Dear donor,";
  const bodyHtml = `
<p>${greeting}</p>
<p>Your gift to <strong>${opts.needTitle}</strong> at ${opts.schoolName} has arrived. The school confirmed receipt on ${dateLine(opts.receivedDate)}.</p>
<p>This is the moment the whole trail was built for: you can see it on the public record, with the date, at <a href="${SITE_URL}/needs/${opts.needId}">${SITE_URL}/needs/${opts.needId}</a></p>
<p>Next, the school has 30 days to file proof of use: invoices, a completion photo, and the final amount spent. We will email you when the fiscal sponsor verifies it.</p>
<p>Thank you for showing up for Detroit students.</p>
<p>The AlumniUp Team</p>`;
  const text = `${greeting}

Your gift to "${opts.needTitle}" at ${opts.schoolName} has arrived. The school confirmed receipt on ${dateLine(opts.receivedDate)}.

See the public record: ${SITE_URL}/needs/${opts.needId}

Next, the school has 30 days to file proof of use: invoices, a completion photo, and the final amount spent. We will email you when the fiscal sponsor verifies it.

Thank you for showing up for Detroit students.

The AlumniUp Team`;
  return { subject, html: shell("Your gift arrived", bodyHtml), text };
}

export function needDelayed(opts: {
  donorName: string | null;
  needTitle: string;
  schoolName: string;
  needId: string;
  reason: string;
}): EmailTemplate {
  const subject = `A delay on a need you funded: ${opts.needTitle}`;
  const greeting = opts.donorName ? `Dear ${opts.donorName},` : "Dear donor,";
  const bodyHtml = `
<p>${greeting}</p>
<p>A need you funded, <strong>${opts.needTitle}</strong> at ${opts.schoolName}, has been marked delayed. Delays are public on AlumniUp, never hidden, and this is the reason:</p>
<p style="background:#F8F7F5;border-left:3px solid #B8882A;padding:12px 16px;">${opts.reason}</p>
<p>We will update the reason at least every 14 days until the need moves again. You can follow it here: <a href="${SITE_URL}/needs/${opts.needId}">${SITE_URL}/needs/${opts.needId}</a></p>
<p>If you have questions, reply to this email or write to <a href="mailto:${CONTACT.support}">${CONTACT.support}</a>.</p>
<p>The AlumniUp Team</p>`;
  const text = `${greeting}

A need you funded, "${opts.needTitle}" at ${opts.schoolName}, has been marked delayed. Delays are public on AlumniUp, never hidden, and this is the reason:

${opts.reason}

We will update the reason at least every 14 days until the need moves again. Follow it here: ${SITE_URL}/needs/${opts.needId}

Questions? Write to ${CONTACT.support}.

The AlumniUp Team`;
  return { subject, html: shell("A delay on your need", bodyHtml), text };
}

export function proofVerified(opts: {
  donorName: string | null;
  needTitle: string;
  schoolName: string;
  needId: string;
  finalAmountSpent: number | null;
}): EmailTemplate {
  const subject = `Verified: your gift to ${opts.schoolName} was spent as stated`;
  const greeting = opts.donorName ? `Dear ${opts.donorName},` : "Dear donor,";
  const spent = opts.finalAmountSpent != null ? ` The final amount spent was ${money(opts.finalAmountSpent)}.` : "";
  const bodyHtml = `
<p>${greeting}</p>
<p>The fiscal sponsor has verified the proof of use for <strong>${opts.needTitle}</strong> at ${opts.schoolName}.${spent}</p>
<p>The need is now marked Use Verified on its public trail. That is the final step: your gift went from donation to verified classroom use, in the open.</p>
<p>See the completed trail: <a href="${SITE_URL}/needs/${opts.needId}">${SITE_URL}/needs/${opts.needId}</a></p>
<p>Thank you for trusting AlumniUp with your gift.</p>
<p>The AlumniUp Team</p>`;
  const text = `${greeting}

The fiscal sponsor has verified the proof of use for "${opts.needTitle}" at ${opts.schoolName}.${spent}

The need is now marked Use Verified on its public trail. That is the final step: your gift went from donation to verified classroom use, in the open.

See the completed trail: ${SITE_URL}/needs/${opts.needId}

Thank you for trusting AlumniUp with your gift.

The AlumniUp Team`;
  return { subject, html: shell("Your gift is verified", bodyHtml), text };
}

export function cancellationChoice(opts: {
  donorName: string | null;
  needTitle: string;
  schoolName: string;
  needId: string;
  amount: number;
  reason: string;
}): EmailTemplate {
  const subject = `A need you funded was cancelled: choose a refund or a redirect`;
  const greeting = opts.donorName ? `Dear ${opts.donorName},` : "Dear donor,";
  const bodyHtml = `
<p>${greeting}</p>
<p>A need you funded, <strong>${opts.needTitle}</strong> at ${opts.schoolName}, was cancelled before any funds were sent. The reason:</p>
<p style="background:#F8F7F5;border-left:3px solid #B8882A;padding:12px 16px;">${opts.reason}</p>
<p>Your gift of <strong>${money(opts.amount)}</strong> is yours to direct. Choose one:</p>
<ul>
<li><strong>Full refund</strong> to your original payment method, typically within 7 business days.</li>
<li><strong>Redirect</strong> your gift to another open need at the same school.</li>
</ul>
<p>Make your choice in My Donations: <a href="${SITE_URL}/my-donations">${SITE_URL}/my-donations</a></p>
<p>If we do not hear from you within 30 days, we will refund your gift automatically.</p>
<p>The AlumniUp Team</p>`;
  const text = `${greeting}

A need you funded, "${opts.needTitle}" at ${opts.schoolName}, was cancelled before any funds were sent. The reason:

${opts.reason}

Your gift of ${money(opts.amount)} is yours to direct. Choose one:

- Full refund to your original payment method, typically within 7 business days.
- Redirect your gift to another open need at the same school.

Make your choice in My Donations: ${SITE_URL}/my-donations

If we do not hear from you within 30 days, we will refund your gift automatically.

The AlumniUp Team`;
  return { subject, html: shell("Choose a refund or a redirect", bodyHtml), text };
}

// ─────────────────────────────────────────────────────────────
// School and sponsor mail
// ─────────────────────────────────────────────────────────────
export function needApproved(opts: { needTitle: string; needId: string; posterName: string }): EmailTemplate {
  const subject = `Your need is live: ${opts.needTitle}`;
  const bodyHtml = `
<p>Hi ${opts.posterName},</p>
<p>Your need <strong>${opts.needTitle}</strong> was approved and is now live for donations.</p>
<p>Share the public link with alumni and supporters: <a href="${SITE_URL}/needs/${opts.needId}">${SITE_URL}/needs/${opts.needId}</a></p>
<p>When the goal is reached, funds move through our fiscal sponsor to your school, and you will be asked to confirm receipt in the portal.</p>
<p>The AlumniUp Team</p>`;
  const text = `Hi ${opts.posterName},

Your need "${opts.needTitle}" was approved and is now live for donations.

Share the public link: ${SITE_URL}/needs/${opts.needId}

When the goal is reached, funds move through our fiscal sponsor to your school, and you will be asked to confirm receipt in the portal.

The AlumniUp Team`;
  return { subject, html: shell("Your need is live", bodyHtml), text };
}

export function needRejected(opts: { needTitle: string; posterName: string; reason: string }): EmailTemplate {
  const subject = `Your need needs changes: ${opts.needTitle}`;
  const bodyHtml = `
<p>Hi ${opts.posterName},</p>
<p>Your need <strong>${opts.needTitle}</strong> was not approved. The reason:</p>
<p style="background:#F8F7F5;border-left:3px solid #B8882A;padding:12px 16px;">${opts.reason}</p>
<p>Your need is saved as a draft in the portal. Edit it and resubmit any time. Nothing about it was ever public.</p>
<p>The AlumniUp Team</p>`;
  const text = `Hi ${opts.posterName},

Your need "${opts.needTitle}" was not approved. The reason:

${opts.reason}

Your need is saved as a draft in the portal. Edit it and resubmit any time. Nothing about it was ever public.

The AlumniUp Team`;
  return { subject, html: shell("Your need needs changes", bodyHtml), text };
}

export function needSubmissionConfirmation(opts: {
  needTitle: string;
  posterName: string;
}): EmailTemplate {
  const subject = `We received your need: ${opts.needTitle}`;
  const bodyHtml = `
<p>Hi ${opts.posterName},</p>
<p>We received your need <strong>${opts.needTitle}</strong>. It is pending review, and you will hear from us once it is approved.</p>
<p>You can track its status in the school portal any time.</p>
<p>The AlumniUp Team</p>`;
  const text = `Hi ${opts.posterName},

We received your need "${opts.needTitle}". It is pending review, and you will hear from us once it is approved.

You can track its status in the school portal any time.

The AlumniUp Team`;
  return { subject, html: shell("Need received", bodyHtml), text };
}

export function schoolRegistrationConfirmation(opts: { schoolName: string; contactName: string }): EmailTemplate {
  const subject = `We received your school registration: ${opts.schoolName}`;
  const bodyHtml = `
<p>Hi ${opts.contactName},</p>
<p>We received the registration for <strong>${opts.schoolName}</strong>. We will verify your school affiliation and write back once your account can post needs.</p>
<p>The AlumniUp Team</p>`;
  const text = `Hi ${opts.contactName},

We received the registration for ${opts.schoolName}. We will verify your school affiliation and write back once your account can post needs.

The AlumniUp Team`;
  return { subject, html: shell("Registration received", bodyHtml), text };
}

export function sponsorInquiryConfirmation(opts: { company: string; contact: string; tier: string }): EmailTemplate {
  const subject = `We received your ${opts.tier} sponsorship inquiry`;
  const bodyHtml = `
<p>Hi ${opts.contact},</p>
<p>Thank you for your interest in sponsoring Detroit schools at the ${opts.tier} tier. We received ${opts.company}'s inquiry and will follow up personally.</p>
<p>The AlumniUp Team</p>`;
  const text = `Hi ${opts.contact},

Thank you for your interest in sponsoring Detroit schools at the ${opts.tier} tier. We received ${opts.company}'s inquiry and will follow up personally.

The AlumniUp Team`;
  return { subject, html: shell("Inquiry received", bodyHtml), text };
}

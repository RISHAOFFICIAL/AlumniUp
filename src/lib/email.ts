// Email notifications — TODO(Resend): NOT YET IMPLEMENTED.
//
// When RESEND_API_KEY is available and the alumniup.org domain is verified in
// Resend, implement real sending here (see https://resend.com/docs) and call
// these from the form API routes (/api/schools/register, /api/sponsors/inquire,
// POST /api/needs).
//
// For now these log to the server console so the form flow still works in mock
// mode without credentials.

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
  // TODO(Resend): send internal notification to schools@alumniup.org and a
  // confirmation to data.workEmail.
  console.log("[email:todo] school registration", data);
}

export async function notifySponsorInquiry(data: SponsorInquiry): Promise<void> {
  // TODO(Resend): send internal notification to sponsors@alumniup.org and a
  // confirmation to data.email.
  console.log("[email:todo] sponsor inquiry", data);
}

export async function notifyNeedSubmission(data: NeedSubmission): Promise<void> {
  // TODO(Resend): two notifications:
  //   1. Confirmation to data.submittedByEmail — "we received your need; it is
  //      pending review and you'll hear from us once it is approved."
  //   2. Admin alert to hello@alumniup.org — "a new need is awaiting approval."
  console.log("[email:todo] need submission (staff confirmation + admin alert)", data);
}

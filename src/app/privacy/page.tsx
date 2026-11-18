import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";
import { CONTACT, CPF_INFO } from "@/types";

export const metadata: Metadata = {
  title: "Privacy Policy | AlumniUp",
  description:
    "What AlumniUp collects, what it never collects, and how your data is used. No advertising trackers, no data brokers, nothing sold.",
};

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy" updated="November 18, 2026">
      <p>
        AlumniUp connects Detroit school alumni and corporate sponsors with verified funding needs
        posted by the coaches, teachers, and administrators who live them. This policy explains
        what we collect, what we never collect, and what happens to your information.
      </p>

      <h2>What AlumniUp collects</h2>
      <ul>
        <li>
          <strong>Donors:</strong> name (optional), email (for the receipt), class year (optional),
          gift amounts and the needs they funded, Wall of Honor message (optional, public if
          provided). Anonymous giving hides the name everywhere public.
        </li>
        <li>
          <strong>School staff:</strong> name, role, school, work email, needs they post (title,
          story, goal, photos), receipt confirmations.
        </li>
        <li>
          <strong>Sponsors:</strong> company, contact name, email, tier of interest.
        </li>
        <li>
          <strong>Technical:</strong> standard server logs. No advertising trackers, no data
          brokers, nothing sold. Ever.
        </li>
      </ul>

      <h2>What AlumniUp never collects</h2>
      <ul>
        <li>
          <strong>Card numbers.</strong> Stripe processes payments. AlumniUp stores no payment
          credentials.
        </li>
        <li>
          <strong>Student data.</strong> AlumniUp serves schools, not students. No student names,
          records, grades, or accounts exist in the system.
        </li>
      </ul>

      <h2>Photos</h2>
      <p>
        Photos are posted by verified school staff, who attest when posting that their school has
        the media releases required for everyone pictured. AlumniUp removes any photo on request
        from the school or a parent or guardian, promptly, at{" "}
        <a href={`mailto:${CONTACT.privacy}`}>{CONTACT.privacy}</a>.
      </p>

      <h2>Sharing</h2>
      <p>
        The fiscal sponsor, {CPF_INFO.name}, receives what it needs to issue receipts and disburse
        funds. Processors: Supabase (database), Stripe (payments), Resend (email), Vercel
        (hosting). No other sharing except where the law requires it.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Gift records are kept while the public trail exists. The trail is the accountability
        record, and removing a gift&apos;s record would falsify it. Accounts can be deleted in the
        portal or by emailing{" "}
        <a href={`mailto:${CONTACT.privacy}`}>{CONTACT.privacy}</a>. Deletion removes the account
        and personal details, while completed gift amounts remain in need totals unattributed.
        Requests are completed within 30 days and confirmed by email.
      </p>

      <h2>Contact</h2>
      <p>
        Privacy questions:{" "}
        <a href={`mailto:${CONTACT.privacy}`}>{CONTACT.privacy}</a>. General support:{" "}
        <a href={`mailto:${CONTACT.support}`}>{CONTACT.support}</a>.
      </p>
    </PolicyPage>
  );
}

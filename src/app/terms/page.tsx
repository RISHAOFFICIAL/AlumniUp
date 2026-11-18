import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";
import { CONTACT, CPF_INFO } from "@/types";

export const metadata: Metadata = {
  title: "Terms of Service | AlumniUp",
  description:
    "The terms for giving through AlumniUp, posting school needs, and using the public money trail.",
};

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service" updated="November 18, 2026">
      <p>
        These terms cover using AlumniUp: giving to a school need, posting a need as verified
        school staff, and reading the public money trail. By using the site, you agree to them.
      </p>

      <h2>What AlumniUp is</h2>
      <p>
        AlumniUp is a crowdfunding platform for Detroit school needs. Every donor can publicly
        track their gift from donation to verified classroom use. Donations are received by{" "}
        {CPF_INFO.name}, a {CPF_INFO.classification} fiscal sponsor (EIN {CPF_INFO.ein}), and are
        tax-deductible to the extent allowed by law. AlumniUp itself is not the recipient of your
        gift. Your tax receipt comes from the fiscal sponsor.
      </p>

      <h2>Giving</h2>
      <ul>
        <li>
          Gifts are made through Stripe hosted checkout. AlumniUp never sees or stores card
          numbers.
        </li>
        <li>
          One-time and monthly gifts are both available. Monthly gifts can be paused or cancelled
          anytime in My Donations. Cancellation stops future charges. Past gifts follow the refund
          rules below.
        </li>
        <li>
          Anonymous giving hides your name everywhere public. You still receive your receipt by
          email.
        </li>
        <li>
          The public trail shows each need&apos;s total given, goal, funded date, disbursement
          date, receipt date, and proof of use. Delays are public too, with the reason stated.
        </li>
      </ul>

      <h2>Posting a need</h2>
      <ul>
        <li>
          Only verified school staff may post needs, and every need is approved by the school
          before it goes public.
        </li>
        <li>
          When posting, staff attest that their school has the media releases required for
          everyone pictured in any photo, and that the need contains no student names or images
          of students.
        </li>
        <li>
          Funds are restricted to the stated need. After the school confirms receipt, it has 30
          days to file proof of use: purchase invoices or receipts, a completion photo, and the
          final amount spent. The school administrator attests the funds were spent as stated,
          and the fiscal sponsor verifies the packet before the need is marked Use Verified.
        </li>
        <li>
          If proof is late, the need shows Proof Overdue and the school cannot post new needs or
          receive new funds until it is filed.
        </li>
        <li>
          Amounts spent below the amount disbursed are returned or, with the sponsor&apos;s
          written approval, redirected to another need at the same school. The trail records
          which.
        </li>
        <li>
          Needs above the sponsor&apos;s threshold may use tranche or direct vendor payment
          structures. The trail records the structure used.
        </li>
      </ul>

      <h2>Refunds, delays, and redirects</h2>
      <p>
        The full policy is on the{" "}
        <a href="/refund-policy">Refund Policy</a> page. In short: a need cancelled before
        disbursement lets every donor choose a full refund or a redirect to another open need at
        the same school, with no response in 30 days meaning a refund. After disbursement, gifts
        cannot be refunded, because the funds are with the school.
      </p>

      <h2>Accounts and conduct</h2>
      <ul>
        <li>Donors may browse and give without an account. A gift history needs an account.</li>
        <li>
          School staff accounts are verified before they can post. AlumniUp may suspend an
          account that posts false needs or misuses funds.
        </li>
        <li>
          Wall of Honor messages are public by the donor&apos;s choice. AlumniUp may remove
          messages that are abusive or off topic.
        </li>
      </ul>

      <h2>Account deletion and wind-down</h2>
      <p>
        Accounts can be deleted in the portal or by emailing{" "}
        <a href={`mailto:${CONTACT.privacy}`}>{CONTACT.privacy}</a>. Completed gift amounts
        remain in need totals unattributed, because the public trail is the accountability
        record. If AlumniUp ever winds down, there will be 90 days public notice, all
        undisbrused funds will be refunded under the refund policy, the public trails will be
        exported to the fiscal sponsor and the schools, and the domain will keep resolving to
        the final report for at least one year.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms:{" "}
        <a href={`mailto:${CONTACT.support}`}>{CONTACT.support}</a>.
      </p>
    </PolicyPage>
  );
}

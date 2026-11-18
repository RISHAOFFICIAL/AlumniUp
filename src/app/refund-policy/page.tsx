import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";
import { CONTACT, CPF_INFO } from "@/types";

export const metadata: Metadata = {
  title: "Refund Policy | AlumniUp",
  description:
    "What happens when a need is cancelled, delayed, or closes below goal. Refunds and redirects, in plain language.",
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage title="Refund Policy" updated="November 18, 2026">
      <p>
        This is the public promise behind the money trail: what happens to your gift when a need
        is cancelled, delayed, or closes below goal. Refunds are executed by the fiscal sponsor,{" "}
        {CPF_INFO.name}, to the original payment method.
      </p>

      <h2>Cancelled need (before disbursement)</h2>
      <p>
        Every donor chooses, by email and in My Donations, a full refund or redirecting the gift
        to another open need at the same school. No response in 30 days means a refund. Refunds
        are executed by the fiscal sponsor to the original payment method, typically within 7
        business days of the choice.
      </p>

      <h2>Funded but delayed</h2>
      <p>
        The need shows Delayed publicly with the reason and the date it was marked. The operator
        updates the reason at least every 14 days until it moves. Donors are emailed when a need
        they funded is marked Delayed.
      </p>

      <h2>Partial funding at close</h2>
      <p>
        The poster and administrator choose, once: extend the deadline, disburse the partial
        amount if it meets the need&apos;s stated minimum to begin, or cancel under the rule
        above. The choice and its date appear on the public trail.
      </p>

      <h2>After disbursement</h2>
      <p>
        Gifts cannot be refunded after disbursement, because the funds are with the school. The
        receipt confirmation and the proof of use are the donor&apos;s record. If the school
        spends less than the amount disbursed, the unspent amount is returned or, with the
        sponsor&apos;s written approval, redirected to another need at the same school, and the
        trail records which.
      </p>

      <h2>Monthly gifts</h2>
      <p>
        Pause or cancel anytime in My Donations. No email or phone call is required. Cancellation
        stops future charges. Past gifts follow the rules above.
      </p>

      <h2>Questions</h2>
      <p>
        Write to <a href={`mailto:${CONTACT.support}`}>{CONTACT.support}</a> with your gift
        reference from your tax receipt email.
      </p>
    </PolicyPage>
  );
}

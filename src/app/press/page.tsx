import type { Metadata } from "next";

const title = "Press | AlumniUp";
const description =
  "About AlumniUp, the Detroit school crowdfunding platform founded by King High alumna Risha Alexis and fiscally sponsored by Childs Play Foundation (501(c)(3)).";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/press",
  },
  twitter: {
    title,
    description,
  },
};

export default function PressPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="bg-navy text-white text-xs text-center py-2 px-4 font-sans tracking-wide">
        Fiscal Sponsor: Childs Play Foundation, Inc. | 501(c)(3) EIN 86-2707543 | All Donations Tax-Deductible | Detroit, MI
      </div>

      <header className="border-b border-border">
        <div className="max-w-page mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="font-serif text-2xl font-bold text-navy">AlumniUp</a>
          <a href="/" className="btn-ghost text-xs px-4 py-2">Back to Home</a>
        </div>
      </header>

      <div className="max-w-page mx-auto px-4 py-16 md:py-24">
        <h1 className="font-serif text-4xl md:text-5xl font-semibold text-navy">Press</h1>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-semibold text-navy">About AlumniUp</h2>
          <p className="font-sans text-navy/80 leading-relaxed mt-4">
            AlumniUp is a crowdfunding platform that connects Detroit public school alumni and corporate
            sponsors with verified funding needs posted by coaches, teachers, and administrators.
            Founded in 2025 by Risha Alexis, a Martin Luther King Jr. Senior High School alumna,
            AlumniUp is fiscally sponsored by Childs Play Foundation, Inc. (501(c)(3) EIN 86-2707543),
            ensuring every donation is tax-deductible and every dollar is accounted for.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-navy">Founder Bio</h2>
          <p className="font-sans text-navy/80 leading-relaxed mt-4">
            Risha Alexis is a Detroit-born engineer, cybersecurity professional, and proud alumna of
            Martin Luther King Jr. Senior High School (King High). After building a career in technology
            and cybersecurity, she founded AlumniUp to address the chronic underfunding of Detroit public
            schools by directly connecting alumni with specific, verified funding needs. She is the
            founder of Lexis Sapphire Studio and is passionate about using technology to serve her hometown.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-navy">Key Facts</h2>
          <div className="mt-4 border border-border rounded overflow-hidden font-sans text-sm">
            <table className="w-full">
              <tbody>
                {[
                  ["Founded", "2025"],
                  ["Location", "Detroit, MI"],
                  ["Fiscal Sponsor", "Childs Play Foundation, Inc. (501(c)(3) EIN 86-2707543)"],
                  ["Founding School", "Martin Luther King Jr. Senior High School"],
                  ["Fee Structure", "88% school, 7% AlumniUp, 5% CPF fiscal sponsor"],
                  ["Built By", "Lexis Sapphire Studio"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium bg-cream w-1/3">{label}</td>
                    <td className="px-4 py-3 text-navy/80">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-semibold text-navy">Press Contact</h2>
          <p className="font-sans text-navy/80 mt-4">
            For press inquiries, please contact:{" "}
            <a href="mailto:press@alumniup.org" className="text-gold hover:underline">press@alumniup.org</a>
          </p>
        </section>
      </div>
    </main>
  );
}
import type { Metadata } from "next";
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alumniup.org"),
  title: "AlumniUp | Supporting Detroit Public Schools Through Giving",
  description:
    "Connect with verified funding needs at Detroit public schools. Tax-deductible giving through fiscal sponsor Childs Play Foundation (501(c)(3)).",
  keywords: [
    "Detroit school donation",
    "donate to Detroit public schools",
    "tax deductible school donation",
    "Detroit education philanthropy",
    "school crowdfunding Detroit",
  ],
  openGraph: {
    type: "website",
    url: "/",
    siteName: "AlumniUp",
    title: "AlumniUp | Supporting Detroit Public Schools Through Giving",
    description:
      "Connect with verified funding needs at Detroit public schools. Tax-deductible giving through fiscal sponsor Childs Play Foundation (501(c)(3)).",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AlumniUp — Support Detroit public schools",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "AlumniUp | Supporting Detroit Public Schools Through Giving",
    description:
      "Connect with verified funding needs at Detroit public schools. Tax-deductible giving through fiscal sponsor Childs Play Foundation (501(c)(3)).",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen bg-white font-sans text-navy antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://alumniup.org/#organization",
                  name: "AlumniUp",
                  url: "https://alumniup.org",
                  description:
                    "Crowdfunding platform connecting Detroit school alumni and corporate sponsors with verified funding needs at Detroit-area public schools.",
                  funder: {
                    "@type": "Organization",
                    name: "Childs Play Foundation, Inc.",
                    taxID: "86-2707543",
                    description:
                      "501(c)(3) fiscal sponsor that receives and disburses tax-deductible donations for AlumniUp.",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://alumniup.org/#website",
                  name: "AlumniUp",
                  url: "https://alumniup.org",
                  publisher: { "@id": "https://alumniup.org/#organization" },
                },
              ],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
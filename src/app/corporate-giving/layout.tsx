import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

const title = "Corporate Sponsorship for Detroit Schools | AlumniUp";
const description =
  "High-impact CSR opportunities for Detroit businesses. Partner with AlumniUp to fund verified school needs and support the next generation of local talent.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/corporate-giving",
  },
  twitter: {
    title,
    description,
  },
};

export default function CorporateGivingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

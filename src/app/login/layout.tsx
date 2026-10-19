import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Sign In | AlumniUp",
  description:
    "Sign in to AlumniUp to manage school funding needs, view donations, and update your school profile.",
  openGraph: {
    title: "Sign In | AlumniUp",
    description:
      "Sign in to AlumniUp to manage school funding needs, view donations, and update your school profile.",
    url: "/login",
  },
  twitter: {
    title: "Sign In | AlumniUp",
    description:
      "Sign in to AlumniUp to manage school funding needs, view donations, and update your school profile.",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
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

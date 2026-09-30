import type { Metadata } from "next";

const title = "Wall of Honor | AlumniUp";
const description =
  "A public record of the alumni and supporters helping Detroit schools. See recognized donors, class-year leaders, and the impact of tax-deductible giving.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/wall-of-honor",
  },
  twitter: {
    title,
    description,
  },
};

export default function WallOfHonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

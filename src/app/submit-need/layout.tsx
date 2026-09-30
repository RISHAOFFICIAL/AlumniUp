import type { Metadata } from "next";

const title = "Submit a Funding Need | AlumniUp for Detroit School Staff";
const description =
  "Detroit coaches, teachers, and administrators can submit verified funding needs for their programs. Start a project to support your students today.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/submit-need",
  },
  twitter: {
    title,
    description,
  },
};

export default function SubmitNeedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

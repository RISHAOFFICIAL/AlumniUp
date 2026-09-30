import type { Metadata } from "next";

const title = "AlumniUp for Schools | Bridging Detroit's Funding Gaps";
const description =
  "Empowering Detroit schools to fund essential programs. Learn how AlumniUp's verified crowdfunding platform and fiscal sponsorship support your school's success.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/for-schools",
  },
  twitter: {
    title,
    description,
  },
};

export default function ForSchoolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

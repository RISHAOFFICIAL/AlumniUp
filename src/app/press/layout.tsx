import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export default function PressLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

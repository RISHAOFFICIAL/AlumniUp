import type { ReactNode } from "react";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <div className="max-w-page mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-serif text-3xl md:text-4xl font-semibold text-navy">{title}</h1>
            <p className="font-sans text-xs text-navy/50 mt-2">Last updated: {updated}</p>
            <div className="mt-8 font-sans text-sm text-navy/80 leading-relaxed space-y-6 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-navy [&_h2]:mt-8 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_a]:text-gold [&_a]:hover:underline">
              {children}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

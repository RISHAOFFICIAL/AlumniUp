"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin/pending", label: "Pending Needs" },
  { href: "/admin/donations", label: "Donations" },
  { href: "/admin/schools", label: "Schools" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/disbursements", label: "Disbursements" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto whitespace-nowrap -mx-4 px-4"
      aria-label="Admin sections"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`px-4 py-3 text-sm font-sans border-b-2 transition-colors ${
              active
                ? "border-gold text-white font-medium"
                : "border-transparent text-cream/70 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

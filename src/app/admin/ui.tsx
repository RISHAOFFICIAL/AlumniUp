// Shared presentational helpers for the admin dashboard.

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString()}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const PILL_STYLES: Record<string, string> = {
  // positive / active
  completed: "bg-green/15 text-green",
  active: "bg-green/15 text-green",
  processed: "bg-green/15 text-green",
  confirmed: "bg-green/15 text-green",
  funded: "bg-green/15 text-green",
  // pending / in progress
  pending: "bg-gold/15 text-gold",
  // negative
  failed: "bg-red-600/15 text-red-700",
  rejected: "bg-red-600/15 text-red-700",
  suspended: "bg-red-600/15 text-red-700",
  refunded: "bg-red-600/15 text-red-700",
  // neutral
  expired: "bg-navy/10 text-navy",
  lapsed: "bg-navy/10 text-navy",
  exempt: "bg-navy/10 text-navy",
  closed: "bg-navy/10 text-navy",
};

export function StatusPill({
  status,
  label,
}: {
  status: string;
  label?: string;
}) {
  const cls = PILL_STYLES[status] ?? "bg-navy/10 text-navy";
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-sans whitespace-nowrap ${cls}`}
    >
      {label ?? status}
    </span>
  );
}

// Framework-agnostic formatting helpers (no web- or native-only imports).

/** Format a number as USD currency (no decimals by default). */
export function formatCurrency(
  amount: number,
  opts: { minimumFractionDigits?: number; maximumFractionDigits?: number } = {}
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.minimumFractionDigits ?? 0,
    maximumFractionDigits: opts.maximumFractionDigits ?? 0,
  }).format(amount);
}

/** Compute a need's percent funded (0–100). */
export function percentFunded(raised: number, goal: number): number {
  if (!goal || goal <= 0) return 0;
  return Math.min(Math.round((raised / goal) * 100), 100);
}

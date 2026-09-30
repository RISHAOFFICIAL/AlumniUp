import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes conditionally.
 * shadcn/ui foundation helper.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

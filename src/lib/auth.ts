import type { Role } from "@/types";

/**
 * Role-based access control (RBAC) definitions.
 *
 * Roles (see public.users.role):
 *   donor           — public donors / alumni (default on signup)
 *   school_staff    — coaches, teachers, and staff at a school
 *   school_admin    — principals / athletic directors
 *   platform_admin  — AlumniUp administrators (Risha)
 *   cpf_admin       — Childs Play Foundation (read-only disbursement view)
 */

export interface RouteGuard {
  prefix: string;
  roles: Role[];
}

// Order matters: more specific prefixes must come first so guardForPath()
// returns the tightest match (e.g. /admin/disbursements before /admin).
export const ROUTE_GUARDS: RouteGuard[] = [
  { prefix: "/admin/disbursements", roles: ["platform_admin", "cpf_admin"] },
  { prefix: "/admin", roles: ["platform_admin"] },
  { prefix: "/portal", roles: ["school_staff", "school_admin"] },
];

export function guardForPath(pathname: string): RouteGuard | null {
  return ROUTE_GUARDS.find((g) => pathname.startsWith(g.prefix)) ?? null;
}

export function canAccessRole(
  role: Role | null | undefined,
  allowed: Role[]
): boolean {
  return !!role && allowed.includes(role);
}

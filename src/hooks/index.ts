// Framework-agnostic hooks for AlumniUp business logic.
// Shared between the web app and the future React Native mobile app.
//
// Data access is behind these hooks. Set NEXT_PUBLIC_DATA_SOURCE to "mock"
// (default, no credentials needed) or "supabase" (requires .env.local). This
// keeps the mock -> Supabase swap a one-line env change.

import { supabase } from "@/lib/supabase";
import {
  mockGetAdminSponsors,
  mockGetAllNeedsForSchool,
  mockGetAllSchools,
  mockGetDisbursements,
  mockGetDonations,
  mockGetNeed,
  mockGetSchool,
  mockGetSchools,
  mockGetSponsors,
} from "@/lib/data/mock";
import type {
  DonationChoice,
  Need,
  ProofPacket,
  Role,
  School,
  TrailEntry,
  UserProfile,
  WallOfHonorEntry,
  ClassYearRank,
  Sponsor,
  DonationRow,
  DisbursementRow,
} from "@/types";
import { useEffect, useState } from "react";
import { useMockStore } from "@/store/mock";
import { trailStatusForNeed } from "@/lib/trail";

const USE_MOCK =
  (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

const URGENCY_ORDER: Record<string, number> = { high: 0, med: 1, low: 2 };

export interface PlatformStats {
  totalRaised: number;
  needsFunded: number;
  donorCount: number;
  schoolCount: number;
}

export interface TopSchool {
  id: string;
  name: string;
  city: string;
  totalRaised: number;
  freeForever: boolean;
}

export function useNeeds(options?: {
  category?: string;
  schoolId?: string;
  status?: string;
}) {
  const mockNeeds = useMockStore((s) => s.needs);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (USE_MOCK) return;
    let cancelled = false;

    async function fetchNeeds() {
      setLoading(true);
      try {
        let query = supabase
          .from("needs")
          .select("*, school:schools(*)");

        if (options?.category) query = query.eq("category", options.category);
        if (options?.schoolId) query = query.eq("school_id", options.schoolId);
        if (options?.status) {
          query = query.eq("status", options.status);
        } else {
          query = query.in("status", ["active", "funded"]);
        }
        query = query.order("urgency", { ascending: true });

        const { data, error: err } = await query;
        if (err) throw err;
        if (!cancelled) setNeeds((data as Need[]) || []);
      } catch (err: any) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchNeeds();
    return () => {
      cancelled = true;
    };
  }, [options?.category, options?.schoolId, options?.status]);

  if (USE_MOCK) {
    const statuses = options?.status ? [options.status] : ["active", "funded"];
    const filtered = mockNeeds
      .filter((need) => {
        if (options?.category && need.category !== options.category) return false;
        if (options?.schoolId && need.school_id !== options.schoolId) return false;
        if (!statuses.includes(need.status)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (URGENCY_ORDER[a.urgency] ?? 9) - (URGENCY_ORDER[b.urgency] ?? 9)
      );
    return { needs: filtered, loading: false, error: null };
  }

  return { needs, loading, error };
}

export function useSchool(schoolId: string) {
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSchool() {
      if (!schoolId) return;
      if (USE_MOCK) {
        const data = mockGetSchool(schoolId);
        if (!cancelled) {
          setSchool(data);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("schools")
        .select("*")
        .eq("id", schoolId)
        .single();
      if (!cancelled) {
        setSchool((data as School) ?? null);
        setLoading(false);
      }
    }

    fetchSchool();
    return () => {
      cancelled = true;
    };
  }, [schoolId]);

  return { school, loading };
}

export function useSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setSchools(mockGetSchools());
      setLoading(false);
      return;
    }

    supabase
      .from("schools")
      .select("*")
      .eq("status", "active")
      .order("name", { ascending: true })
      .then(({ data }) => {
        setSchools((data as School[]) || []);
        setLoading(false);
      });
  }, []);

  return { schools, loading };
}

export function useDonationStats(): PlatformStats {
  const mockNeeds = useMockStore((s) => s.needs);
  const [stats, setStats] = useState<PlatformStats>({
    totalRaised: 0,
    needsFunded: 0,
    donorCount: 0,
    schoolCount: 0,
  });

  useEffect(() => {
    if (USE_MOCK) return;
    let cancelled = false;

    async function fetchStats() {
      // Donations are private (RLS), so aggregate stats come from a
      // SECURITY DEFINER function that exposes only platform-wide numbers.
      const { data, error } = await supabase.rpc("get_platform_stats");
      if (error || !data) {
        const { data: needs } = await supabase
          .from("needs")
          .select("raised_amount, status");
        const { data: schools } = await supabase
          .from("schools")
          .select("id")
          .eq("status", "active");
        if (!cancelled) {
          setStats({
            totalRaised:
              (needs as { raised_amount: number }[])?.reduce(
                (sum, n) => sum + (n.raised_amount || 0),
                0
              ) || 0,
            needsFunded:
              (needs as { status: string }[])?.filter(
                (n) => n.status === "funded"
              ).length || 0,
            donorCount: 0,
            schoolCount: (schools as { id: string }[])?.length || 0,
          });
        }
        return;
      }

      if (!cancelled) {
        setStats({
          totalRaised: Number(data.total_raised) || 0,
          needsFunded: Number(data.needs_funded) || 0,
          donorCount: Number(data.alumni_donors) || 0,
          schoolCount: Number(data.school_count) || 0,
        });
      }
    }

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  if (USE_MOCK) {
    const activeNeeds = mockNeeds.filter((n) =>
      ["active", "funded"].includes(n.status)
    );
    return {
      totalRaised: activeNeeds.reduce((sum, n) => sum + n.raised_amount, 0),
      needsFunded: mockNeeds.filter((n) => n.status === "funded").length,
      donorCount: mockNeeds.reduce((sum, n) => sum + n.backer_count, 0),
      schoolCount: mockGetSchools().length,
    };
  }

  return stats;
}

export function useWallOfHonor(limit?: number) {
  const mockEntries = useMockStore((s) => s.wallOfHonor);
  const [entries, setEntries] = useState<WallOfHonorEntry[]>([]);

  useEffect(() => {
    if (USE_MOCK) return;

    let query = supabase
      .from("wall_of_honor")
      .select("*")
      .order("created_at", { ascending: false });
    if (limit) query = query.limit(limit);
    query.then(({ data }) => setEntries((data as WallOfHonorEntry[]) || []));

    const subscription = supabase
      .channel("wall_of_honor_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "wall_of_honor" },
        (payload) => {
          setEntries((prev) => {
            const next = [(payload.new as WallOfHonorEntry), ...prev];
            return limit ? next.slice(0, limit) : next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [limit]);

  if (USE_MOCK) {
    const sorted = [...mockEntries].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }

  return entries;
}

/**
 * Donors aggregated by graduation year, ranked by total raised. Drives the
 * alumni class-competition loop on the Wall of Honor page.
 */
export function useClassYearLeaderboard() {
  const mockEntries = useMockStore((s) => s.wallOfHonor);
  const [ranks, setRanks] = useState<ClassYearRank[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;

    // Real path: a SECURITY DEFINER function aggregates wall_of_honor by
    // graduation_year (donations themselves are RLS-protected). The function
    // is defined in supabase/schema.sql as get_class_year_leaderboard().
    supabase
      .rpc("get_class_year_leaderboard")
      .then(({ data, error }) => {
        if (!error && data) setRanks(data as ClassYearRank[]);
        setLoading(false);
      });
  }, []);

  if (USE_MOCK) {
    const map = new Map<string, { total: number; donors: number }>();
    mockEntries.forEach((e) => {
      if (!e.graduation_year) return;
      const cur = map.get(e.graduation_year) ?? { total: 0, donors: 0 };
      cur.total += e.amount_display ?? 0;
      cur.donors += 1;
      map.set(e.graduation_year, cur);
    });
    const derived = Array.from(map.entries())
      .map(([year, v]) => ({
        graduation_year: year,
        total_raised: v.total,
        donor_count: v.donors,
      }))
      .sort((a, b) => b.total_raised - a.total_raised);
    return { ranks: derived, loading: false };
  }

  return { ranks, loading };
}

export function useSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);

  useEffect(() => {
    if (USE_MOCK) {
      setSponsors(mockGetSponsors());
      return;
    }

    supabase
      .from("sponsors")
      .select("*")
      .eq("status", "active")
      .order("amount_committed", { ascending: false })
      .then(({ data }) => setSponsors((data as Sponsor[]) || []));
  }, []);

  return sponsors;
}

export function useTopSchools() {
  const mockNeeds = useMockStore((s) => s.needs);
  const [schools, setSchools] = useState<TopSchool[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;

    // Supabase: derive totals from the public needs + schools tables.
    supabase
      .from("needs")
      .select("school_id, raised_amount, school:schools(name, city, free_forever)")
      .in("status", ["active", "funded"])
      .then(({ data }) => {
        // Supabase's generated type for a nested join is loose; use any to
        // keep this fallback branch (only used with real Supabase creds) simple.
        const needs = (data || []) as any[];
        const map = new Map<
          string,
          { name: string; city: string; freeForever: boolean; totalRaised: number }
        >();
        needs.forEach((n) => {
          const cur = map.get(n.school_id) ?? {
            name: n.school?.name ?? "",
            city: n.school?.city ?? "",
            freeForever: n.school?.free_forever ?? false,
            totalRaised: 0,
          };
          cur.totalRaised += n.raised_amount || 0;
          map.set(n.school_id, cur);
        });
        const rows: TopSchool[] = Array.from(map.entries()).map(
          ([id, v]) => ({
            id,
            name: v.name,
            city: v.city,
            totalRaised: v.totalRaised,
            freeForever: v.freeForever,
          })
        );
        setSchools(rows.sort((a, b) => b.totalRaised - a.totalRaised));
        setLoading(false);
      });
  }, []);

  if (USE_MOCK) {
    const raisedBySchool = new Map<string, number>();
    mockNeeds.forEach((n) => {
      raisedBySchool.set(
        n.school_id,
        (raisedBySchool.get(n.school_id) ?? 0) + n.raised_amount
      );
    });
    const derived = mockGetSchools()
      .map((s) => ({
        id: s.id,
        name: s.name,
        city: s.city,
        totalRaised: raisedBySchool.get(s.id) ?? 0,
        freeForever: s.free_forever,
      }))
      .sort((a, b) => b.totalRaised - a.totalRaised);
    return { schools: derived, loading: false };
  }

  return { schools, loading };
}

/**
 * Current authenticated user and their public profile (incl. role).
 * In mock mode there is no auth, so it resolves to a signed-out state.
 */
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function refresh(sessionUserId: string | null) {
      if (!sessionUserId) {
        if (!cancelled) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUserId)
        .single();
      if (!cancelled) {
        setProfile((data as UserProfile) ?? null);
        setLoading(false);
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      if (!cancelled) setUser(u);
      return refresh(u?.id ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      if (!cancelled) setUser(u);
      refresh(u?.id ?? null);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    profile,
    role: (profile?.role ?? null) as Role | null,
    loading,
  };
}

/**
 * All schools including pending applicants (admin schools view).
 */
export function useAllSchools() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setSchools(mockGetAllSchools());
      setLoading(false);
      return;
    }

    supabase
      .from("schools")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data }) => {
        setSchools((data as School[]) || []);
        setLoading(false);
      });
  }, []);

  return { schools, loading };
}

/**
 * All donations (admin view). Donor identity is limited to display_name;
 * raw emails are never returned to the UI.
 */
export function useDonations() {
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setDonations(mockGetDonations());
      setLoading(false);
      return;
    }

    supabase
      .from("donations")
      .select("id, amount, is_anonymous, display_name, is_recurring, status, created_at, need_id, need:needs(title)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = ((data as any[]) || []).map((d) => ({
          ...d,
          need_title: d.need?.title ?? "—",
        })) as DonationRow[];
        setDonations(rows);
        setLoading(false);
      });
  }, []);

  return { donations, loading };
}

/**
 * Disbursements (read-only admin / CPF view).
 */
export function useDisbursements() {
  const [disbursements, setDisbursements] = useState<DisbursementRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setDisbursements(mockGetDisbursements());
      setLoading(false);
      return;
    }

    supabase
      .from("disbursements")
      .select("*, school:schools(name), need:needs(title)")
      .order("requested_at", { ascending: false })
      .then(({ data }) => {
        const rows = ((data as any[]) || []).map((d) => ({
          ...d,
          school_name: d.school?.name ?? "—",
          need_title: d.need?.title ?? null,
        })) as DisbursementRow[];
        setDisbursements(rows);
        setLoading(false);
      });
  }, []);

  return { disbursements, loading };
}

/**
 * All sponsors regardless of status (admin sponsors view).
 */
export function useAdminSponsors() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (USE_MOCK) {
      setSponsors(mockGetAdminSponsors());
      setLoading(false);
      return;
    }

    supabase
      .from("sponsors")
      .select("*")
      .order("amount_committed", { ascending: false })
      .then(({ data }) => {
        setSponsors((data as Sponsor[]) || []);
        setLoading(false);
      });
  }, []);

  return { sponsors, loading };
}

/**
 * All of a school's needs (any status) for the school portal.
 * Mock mode reads the Zustand store so trail transitions made in the
 * portal (receipt confirmation, proof filing) show up immediately.
 */
export function useSchoolNeeds(schoolId: string) {
  const mockNeeds = useMockStore((s) => s.needs);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    if (USE_MOCK) {
      setLoading(false);
      return;
    }

    supabase
      .from("needs")
      .select("*")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setNeeds((data as Need[]) || []);
        setLoading(false);
      });
  }, [schoolId]);

  if (USE_MOCK) {
    const all = mockGetAllNeedsForSchool(schoolId);
    // Overlay live store state (trail transitions, donations) on the seed rows.
    const byId = new Map(mockNeeds.map((n) => [n.id, n]));
    const merged = all.map((n) => byId.get(n.id) ?? n);
    return { needs: merged, loading: false };
  }

  return { needs, loading };
}

/**
 * Donation activity scoped to one school (school portal). Only display-safe
 * fields are selected — donor_email is never returned to the UI.
 */export function useSchoolDonations(schoolId: string) {
  const mockDonations = useMockStore((s) => s.donations);
  const mockNeeds = useMockStore((s) => s.needs);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    if (USE_MOCK) {
      setLoading(false);
      return;
    }

    supabase
      .from("donations")
      .select(
        "id, amount, is_anonymous, display_name, is_recurring, status, created_at, need_id, need:needs(title, school_id)"
      )
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = ((data as any[]) || [])
          .filter((d) => d.need?.school_id === schoolId)
          .map((d) => ({
            ...d,
            need_title: d.need?.title ?? "—",
          })) as DonationRow[];
        setDonations(rows);
        setLoading(false);
      });
  }, [schoolId]);

  if (USE_MOCK) {
    const schoolNeedIds = new Set(
      mockNeeds.filter((n) => n.school_id === schoolId).map((n) => n.id)
    );
    const rows: DonationRow[] = mockDonations
      .filter((d) => schoolNeedIds.has(d.need_id))
      .map((d) => ({
        ...d,
        need_title: mockNeeds.find((n) => n.id === d.need_id)?.title ?? "—",
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { donations: rows, loading: false };
  }

  return { donations, loading };
}

// ─────────────────────────────────────────────────────────────
// Public money trail hooks
// ─────────────────────────────────────────────────────────────

/**
 * One need by id, with its public trail attached (S3 need detail).
 * Mock mode reads the Zustand store so trail transitions made in the
 * portal or admin show up immediately.
 */
export function useNeed(needId: string) {
  const mockNeeds = useMockStore((s) => s.needs);
  const mockTrail = useMockStore((s) => s.trailEntries);
  const [need, setNeed] = useState<Need | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !needId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    Promise.all([
      supabase.from("needs").select("*, school:schools(*)").eq("id", needId).single(),
      supabase
        .from("trail_entries")
        .select("*")
        .eq("need_id", needId)
        .order("created_at", { ascending: true }),
    ]).then(([{ data: n }, { data: trail }]) => {
      if (cancelled) return;
      if (!n) {
        setNeed(null);
      } else {
        setNeed({ ...(n as Need), trail: (trail as TrailEntry[]) ?? [] });
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [needId]);

  if (USE_MOCK) {
    const found = mockNeeds.find((n) => n.id === needId) ?? mockGetNeed(needId);
    if (!found) return { need: null, loading: false };
    const trail = mockTrail
      .filter((t) => t.need_id === needId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return { need: { ...found, trail }, loading: false };
  }

  return { need, loading };
}

/**
 * Dated trail entries for one need, oldest first.
 */
export function useTrail(needId: string) {
  const mockTrail = useMockStore((s) => s.trailEntries);
  const [entries, setEntries] = useState<TrailEntry[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !needId) {
      setLoading(false);
      return;
    }
    supabase
      .from("trail_entries")
      .select("*")
      .eq("need_id", needId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setEntries((data as TrailEntry[]) ?? []);
        setLoading(false);
      });
  }, [needId]);

  if (USE_MOCK) {
    return {
      entries: mockTrail
        .filter((t) => t.need_id === needId)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
      loading: false,
    };
  }

  return { entries, loading };
}

/**
 * The signed-in donor's own gift history (S7 My Donations). Mock mode
 * shows the sample gifts as one demo donor's history.
 */
export function useMyDonations() {
  const mockDonations = useMockStore((s) => s.donations);
  const mockNeeds = useMockStore((s) => s.needs);
  const mockChoices = useMockStore((s) => s.donationChoices);
  const { user, loading: authLoading } = useAuth();
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;
    if (authLoading) return;
    if (!user) {
      setDonations([]);
      setLoading(false);
      return;
    }
    supabase
      .from("donations")
      .select("*, need:needs(title, trail_status, status, school_id), choice:donation_choices(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = ((data as any[]) || []).map((d) => ({
          ...d,
          need_title: d.need?.title ?? "—",
          need_trail_status: d.need?.trail_status ?? null,
          need_school_id: d.need?.school_id ?? null,
          choice: Array.isArray(d.choice) ? d.choice[0] ?? null : d.choice ?? null,
        })) as DonationRow[];
        setDonations(rows);
        setLoading(false);
      });
  }, [user, authLoading]);

  if (USE_MOCK) {
    const rows: DonationRow[] = mockDonations
      .map((d) => {
        const need = mockNeeds.find((n) => n.id === d.need_id);
        return {
          ...d,
          need_title: need?.title ?? "—",
          need_trail_status: need ? trailStatusForNeed(need) : null,
          need_school_id: need?.school_id ?? null,
          choice: mockChoices.find((c) => c.donation_id === d.id) ?? null,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { donations: rows, loading: false, signedIn: true };
  }

  return { donations, loading: loading || authLoading, signedIn: !!user };
}

/**
 * The proof-of-use packet for one need, if one exists.
 */
export function useProofPacket(needId: string) {
  const mockPackets = useMockStore((s) => s.proofPackets);
  const [packet, setPacket] = useState<ProofPacket | null>(null);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK || !needId) {
      setLoading(false);
      return;
    }
    supabase
      .from("proof_packets")
      .select("*")
      .eq("need_id", needId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setPacket((data as ProofPacket) ?? null);
        setLoading(false);
      });
  }, [needId]);

  if (USE_MOCK) {
    return {
      packet: mockPackets.find((p) => p.need_id === needId) ?? null,
      loading: false,
    };
  }

  return { packet, loading };
}

/**
 * Proof packets awaiting sponsor review (S14 proof queue).
 */
export function useProofQueue() {
  const mockPackets = useMockStore((s) => s.proofPackets);
  const mockNeeds = useMockStore((s) => s.needs);
  const [queue, setQueue] = useState<
    (ProofPacket & { need_title: string; school_name: string })[]
  >([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;
    supabase
      .from("proof_packets")
      .select("*, need:needs(title, school:schools(name))")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = ((data as any[]) || []).map((p) => ({
          ...p,
          need_title: p.need?.title ?? "—",
          school_name: p.need?.school?.name ?? "—",
        }));
        setQueue(rows);
        setLoading(false);
      });
  }, []);

  if (USE_MOCK) {
    const rows = mockPackets.map((p) => {
      const need = mockNeeds.find((n) => n.id === p.need_id);
      return {
        ...p,
        need_title: need?.title ?? "Unknown need",
        school_name: need?.school?.name ?? "Unknown school",
      };
    });
    return { queue: rows, loading: false };
  }

  return { queue, loading };
}

/**
 * All needs for the operator trail view (S14), any status.
 */
export function useAllNeeds() {
  const mockNeeds = useMockStore((s) => s.needs);
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;
    supabase
      .from("needs")
      .select("*, school:schools(*)")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setNeeds((data as Need[]) ?? []);
        setLoading(false);
      });
  }, []);

  if (USE_MOCK) {
    return {
      needs: [...mockNeeds].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      loading: false,
    };
  }

  return { needs, loading };
}

export type { DonationChoice };

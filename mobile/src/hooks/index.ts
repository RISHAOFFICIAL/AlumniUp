// Framework-agnostic hooks for AlumniUp business logic (mirrors the web app).
//
// Data access is behind these hooks. Set EXPO_PUBLIC_DATA_SOURCE to "mock"
// (default, no credentials needed) or "supabase" (requires Supabase creds).
// The mock paths are identical to the web app so a completed donation updates
// progress bars, the Wall of Honor, and the class-year leaderboard live.

import { supabase } from "@/lib/supabase";
import {
  mockGetSchools,
  mockGetSchool,
  mockGetWallOfHonor,
} from "@/lib/data/mock";
import type {
  Need,
  Role,
  School,
  UserProfile,
  WallOfHonorEntry,
  ClassYearRank,
} from "@/types";
import { useEffect, useState } from "react";
import { useMockStore } from "@/store/mock";

const USE_MOCK =
  (process.env.EXPO_PUBLIC_DATA_SOURCE ?? "mock") === "mock";

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
 * alumni class-competition loop on the Wall of Honor screen.
 */
export function useClassYearLeaderboard() {
  const mockEntries = useMockStore((s) => s.wallOfHonor);
  const [ranks, setRanks] = useState<ClassYearRank[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;

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

export function useTopSchools() {
  const mockNeeds = useMockStore((s) => s.needs);
  const [schools, setSchools] = useState<TopSchool[]>([]);
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;

    supabase
      .from("needs")
      .select("school_id, raised_amount, school:schools(name, city, free_forever)")
      .in("status", ["active", "funded"])
      .then(({ data }) => {
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

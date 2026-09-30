"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  setProfile: (profile: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    set({ user, loading: false, initialized: true });

    if (user) {
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      set({ profile: (profile as UserProfile) ?? null });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  setProfile: (profile) => set({ profile }),
}));

/** Helper: is the current user a platform admin? */
export function isPlatformAdmin(role?: string | null): boolean {
  return role === "platform_admin";
}

/** Helper: is the current user school staff/admin? */
export function isSchoolStaff(role?: string | null): boolean {
  return role === "school_staff" || role === "school_admin";
}

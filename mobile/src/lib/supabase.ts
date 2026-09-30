import { createClient } from "@supabase/supabase-js";

// Shared Supabase client for the mobile app. Reads EXPO_PUBLIC_* env vars,
// which Expo inlines at bundle time. Placeholder fallbacks prevent a hard
// crash before real credentials exist — the hooks never touch Supabase while
// EXPO_PUBLIC_DATA_SOURCE=mock (the default).
//
// NOTE: for real auth session persistence on device, @react-native-async-storage/
// async-storage must be added so supabase-js can persist the session. Phase 1
// runs in mock mode, so it is intentionally omitted.
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key-placeholder";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

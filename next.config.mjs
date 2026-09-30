/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'alumniup.org'],
  },
  // Expose the public Supabase config to the client bundle. The anon key is
  // public by design (RLS-limited); the service-role key is intentionally NOT
  // mapped here — it stays server-only via SERVICE_ROLE_SECRET.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: 'https://ttrpafvvacbdomwxxbru.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.ANON ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
};

export default nextConfig;

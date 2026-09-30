// Apply supabase/schema.sql + seed data to the live AlumniUp Supabase project.
//
// Usage:
//   SUPABASE_DB_PASSWORD=... node scripts/apply-schema.mjs
//
// Connection strategy:
//   - Prefers a full connection string via SUPABASE_DATABASE_URL (fallback
//     DATABASE_URL) when present.
//   - Otherwise builds the Supabase SESSION pooler URL (port 5432 — session mode
//     is required for multi-statement schema/DDL) from SUPABASE_DB_PASSWORD.
//
// Idempotent: if the `needs` table already exists, only the seed INSERTs are
// re-run (they use ON CONFLICT DO NOTHING / WHERE EXISTS guards).
import { readFile } from "node:fs/promises";
import pg from "pg";

const fullUrl =
  process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || "";
const password = process.env.SUPABASE_DB_PASSWORD || "";

let connectionString;
if (fullUrl) {
  connectionString = fullUrl;
} else if (password) {
  const encoded = encodeURIComponent(password);
  connectionString = `postgresql://postgres.ttrpafvvacbdomwxxbru:${encoded}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`;
} else {
  console.error(
    "Neither SUPABASE_DATABASE_URL/DATABASE_URL nor SUPABASE_DB_PASSWORD is set. Aborting."
  );
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("Connected.");

const sql = await readFile(
  new URL("../supabase/schema.sql", import.meta.url),
  "utf8"
);
const seedMarker = "-- SEED DATA";
const seedIdx = sql.indexOf(seedMarker);

const { rows } = await client.query(
  "SELECT to_regclass('public.needs') AS t"
);
const applied = !!(rows[0] && rows[0].t);

if (applied) {
  console.log("Schema already applied — re-running seed only (idempotent).");
  await client.query(sql.slice(seedIdx));
} else {
  console.log("Applying full schema + seed...");
  await client.query(sql);
}

await client.end();
console.log("Done.");

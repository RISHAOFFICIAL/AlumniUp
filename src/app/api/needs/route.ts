import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const schoolId = searchParams.get("schoolId");
  const status = searchParams.get("status") || "active";

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  try {
    let query = supabase.from("needs").select("*, school:schools(*)");
    if (category) query = query.eq("category", category);
    if (schoolId) query = query.eq("school_id", schoolId);
    if (status === "all") {
      query = query.not("status", "eq", "rejected");
    } else {
      query = query.eq("status", status);
    }
    query = query.order("urgency", { ascending: true });
    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ needs: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch needs" },
      { status: 500 }
    );
  }
}

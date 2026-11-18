import type { Metadata } from "next";
import { Suspense } from "react";
import NeedDetailClient from "./NeedDetailClient";
import { mockGetNeed } from "@/lib/data/mock";

// S3 Need detail. The metadata comes from the need itself so a shared link
// opens with the need's title and photo as the preview (Stage 2 story 7).
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const useMock = (process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "mock";
  let title = "A Detroit school need";
  let description =
    "Fund a verified Detroit school need and follow your gift in public, from donation to verified classroom use.";
  let image: string | undefined;

  if (useMock) {
    const need = mockGetNeed(params.id);
    if (need) {
      title = need.title;
      description = need.description;
      image = need.photo_url ?? undefined;
    }
  } else {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = createClient();
      const { data } = await supabase
        .from("needs")
        .select("title, description, photo_url")
        .eq("id", params.id)
        .single();
      if (data) {
        title = data.title;
        description = data.description;
        image = data.photo_url ?? undefined;
      }
    } catch {
      // Metadata is best-effort; the page itself still renders.
    }
  }

  return {
    title: `${title} | AlumniUp`,
    description,
    openGraph: {
      title: `${title} | AlumniUp`,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AlumniUp`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default function NeedDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense
      fallback={
        <div className="max-w-page mx-auto px-4 py-16">
          <p className="font-sans text-navy/60">Loading need…</p>
        </div>
      }
    >
      <NeedDetailClient needId={params.id} />
    </Suspense>
  );
}

import type { MetadataRoute } from "next";

/**
 * Public sitemap. Auth-gated areas (/admin, /portal, /login) and API routes
 * are intentionally excluded from indexing.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://alumniup.org";

  const routes: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "weekly" },
    { path: "/for-schools", priority: 0.8, changeFrequency: "monthly" },
    { path: "/corporate-giving", priority: 0.8, changeFrequency: "monthly" },
    { path: "/wall-of-honor", priority: 0.8, changeFrequency: "weekly" },
    { path: "/submit-need", priority: 0.7, changeFrequency: "monthly" },
    { path: "/press", priority: 0.5, changeFrequency: "monthly" },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/login", "/api/"],
    },
    sitemap: "https://alumniup.org/sitemap.xml",
  };
}

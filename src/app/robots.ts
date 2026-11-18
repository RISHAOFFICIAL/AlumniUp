import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/login", "/my-donations", "/donate", "/api/"],
    },
    sitemap: "https://www.alumniupdetroit.org/sitemap.xml",
  };
}

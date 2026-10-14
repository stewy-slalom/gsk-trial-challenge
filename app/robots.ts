import type { MetadataRoute } from "next";

// §4: restrictive robots directive, no sitemap, nothing served to
// unauthenticated agents.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", disallow: "/" },
  };
}

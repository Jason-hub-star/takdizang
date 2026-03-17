/** robots.txt generation */
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/landing",
        disallow: ["/api/", "/projects/", "/settings", "/workspace", "/uploads/"],
      },
    ],
  };
}

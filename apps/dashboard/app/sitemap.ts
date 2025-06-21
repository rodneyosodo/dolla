import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "/",
      lastModified: new Date().toISOString(),
      priority: 1,
    },
    {
      url: "/dashboard",
      lastModified: new Date().toISOString(),
      priority: 1,
    },
    {
      url: "/expenses",
      lastModified: new Date().toISOString(),
      priority: 0.8,
    },
    {
      url: "/income",
      lastModified: new Date().toISOString(),
      priority: 0.8,
    },
    {
      url: "/budget",
      lastModified: new Date().toISOString(),
      priority: 0.8,
    },
  ];
}

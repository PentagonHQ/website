import type { MetadataRoute } from 'next'
import { sitemapURLs } from '../data'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...sitemapURLs.map((page: { url: string }) => ({
      url: page.url,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    }))
  ]
}
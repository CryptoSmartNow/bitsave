import { getDatabase } from '@/lib/mongodb';

export async function GET(): Promise<Response> {
  try {
    const db = await getDatabase();
    
    if (!db) {
      throw new Error('Database connection failed');
    }
    
    const postsCollection = db.collection('blog_posts');

    // Get all published blog posts
    const posts = await postsCollection
      .find({ published: true })
      .sort({ publishedAt: -1 })
      .toArray();

    const baseUrl = 'https://bitsave.io';
    const currentDate = new Date().toISOString();

    // Static pages
    const staticPages = [
      {
        url: baseUrl,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 1.0
      },
      {
        url: `${baseUrl}/blog`,
        lastModified: currentDate,
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/dashboard`,
        lastModified: currentDate,
        changeFrequency: 'weekly',
        priority: 0.8
      }
    ];

    // Blog post pages
    const blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || post.createdAt).toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7
    }));

    // Combine all URLs
    const allPages = [...staticPages, ...blogPages];

    // Generate XML sitemap
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Fallback sitemap with just static pages
    const baseUrl = 'https://bitsave.io';
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

    return new Response(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600'
      }
    });
  }
}
export async function GET(): Promise<Response> {
  const robotsTxt = `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /dashboard/

# Allow blog content
Allow: /blog/

# Sitemap
Sitemap: https://bitsave.io/sitemap.xml

# Crawl delay
Crawl-delay: 1`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
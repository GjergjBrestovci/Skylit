import fs from 'fs';
import path from 'path';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export class SitemapGenerator {
  private baseUrl: string;
  private urls: SitemapUrl[] = [];

  constructor(baseUrl: string = 'https://skylit.ai') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  addUrl(url: SitemapUrl) {
    this.urls.push(url);
  }

  addUrls(urls: SitemapUrl[]) {
    this.urls.push(...urls);
  }

  generateSitemap(): string {
    const urlsXml = this.urls.map(url => {
      const loc = url.loc.startsWith('http') ? url.loc : `${this.baseUrl}${url.loc}`;
      return `  <url>
    <loc>${this.escapeXml(loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
  }

  async generateRobotsTxt(): Promise<string> {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Disallow private areas
Disallow: /api/
Disallow: /admin/
Disallow: /preview/
Disallow: /_internal/

# Allow important pages
Allow: /
Allow: /pricing
Allow: /templates
Allow: /docs
Allow: /about
Allow: /contact

# Crawl delay
Crawl-delay: 1`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  static getDefaultUrls(): SitemapUrl[] {
    const now = new Date().toISOString();
    
    return [
      {
        loc: '/',
        lastmod: now,
        changefreq: 'daily',
        priority: 1.0
      },
      {
        loc: '/pricing',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.9
      },
      {
        loc: '/templates',
        lastmod: now,
        changefreq: 'daily',
        priority: 0.8
      },
      {
        loc: '/templates/landing',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: '/templates/business',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: '/templates/portfolio',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: '/templates/ecommerce',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: '/templates/blog',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: '/templates/creative',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
      },
      {
        loc: '/docs',
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.6
      },
      {
        loc: '/about',
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.5
      },
      {
        loc: '/contact',
        lastmod: now,
        changefreq: 'monthly',
        priority: 0.5
      }
    ];
  }
}

export default SitemapGenerator;

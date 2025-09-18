import { Router, Request, Response } from 'express';
import { SitemapGenerator } from '../utils/SitemapGenerator';

const router = Router();

// Generate and serve sitemap.xml
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const sitemapGenerator = new SitemapGenerator(process.env.FRONTEND_URL || 'https://skylit.ai');
    
    // Add default URLs
    sitemapGenerator.addUrls(SitemapGenerator.getDefaultUrls());
    
    // TODO: Add dynamic URLs from database (popular templates, public projects, etc.)
    // const popularTemplates = await getPopularTemplates();
    // const templateUrls = popularTemplates.map(template => ({
    //   loc: `/templates/${template.id}`,
    //   lastmod: template.updatedAt,
    //   changefreq: 'weekly' as const,
    //   priority: 0.6
    // }));
    // sitemapGenerator.addUrls(templateUrls);

    const sitemap = sitemapGenerator.generateSitemap();
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(sitemap);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Generate and serve robots.txt
router.get('/robots.txt', async (req: Request, res: Response) => {
  try {
    const sitemapGenerator = new SitemapGenerator(process.env.FRONTEND_URL || 'https://skylit.ai');
    const robotsTxt = await sitemapGenerator.generateRobotsTxt();
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(robotsTxt);
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    res.status(500).send('Error generating robots.txt');
  }
});

// OpenGraph image generation endpoint (for dynamic OG images)
router.get('/og-image/:type?', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { title, description } = req.query;

    // For now, serve a static OG image
    // TODO: Implement dynamic OG image generation using canvas or similar
    const defaultImage = '/og-images/default.jpg';
    
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    
    // For now, redirect to static image
    // In production, you'd generate the image dynamically
    res.redirect(defaultImage);
  } catch (error) {
    console.error('Error generating OG image:', error);
    res.status(500).send('Error generating image');
  }
});

export default router;

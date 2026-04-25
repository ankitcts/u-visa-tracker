/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://uvisatracker.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  sitemapSize: 5000,
  exclude: ['/api/*', '/loading', '/not-found'],
  // Per-route priority + changefreq hints. High = landing/program pages,
  // medium = data deep-dives, low = legal boilerplate.
  transform: async (_config, path) => {
    const high = ['/', '/u-visa', '/news', '/dashboard'];
    const medium = [
      '/about',
      '/sources',
      '/archives',
      '/backlog',
      '/geography',
      '/analyze',
      '/integrity',
      '/litigation',
    ];
    const legal = ['/disclaimer', '/privacy', '/terms'];
    let priority = 0.5;
    let changefreq = 'monthly';
    if (high.includes(path)) {
      priority = 1.0;
      changefreq = path === '/news' ? 'hourly' : 'daily';
    } else if (medium.includes(path)) {
      priority = 0.7;
      changefreq = 'weekly';
    } else if (legal.includes(path)) {
      priority = 0.3;
      changefreq = 'yearly';
    }
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      // Block AI training crawlers.
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
      { userAgent: 'anthropic-ai', disallow: '/' },
      { userAgent: 'ClaudeBot', disallow: '/' },
    ],
  },
};

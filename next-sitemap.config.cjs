/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://tech-book-lime.vercel.app',
  generateRobotsTxt: true, 
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 1,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },
};

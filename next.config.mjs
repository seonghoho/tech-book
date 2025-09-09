/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  async redirects() {
    const primary = process.env.PRIMARY_DOMAIN; // e.g., example.com
    const legacy = process.env.OLD_HOST; // e.g., tech-book-lime.vercel.app
    if (!primary || !legacy) return [];
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: legacy }],
        destination: `https://${primary}/:path*`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

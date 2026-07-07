/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      // Legacy history route — content is now the landing page.
      // Use an HTTP 308 so search engines update their index instead of
      // treating the destination as a duplicate of a "redirected" page.
      { source: '/history', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;

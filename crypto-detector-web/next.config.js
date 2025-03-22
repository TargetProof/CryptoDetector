/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  // Add this to ensure API routes work correctly
  experimental: {
    serverActions: true,
  }
};

module.exports = {
  nextConfig;
  output: 'standalone',
  // This helps with Azure deployment
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // other config options...
};

module.exports = {
  output: 'standalone',
  reactStrictMode: true,
  // Add this to handle dynamic API routes
  experimental: {
    allowDynamicRoutes: true
  }
};

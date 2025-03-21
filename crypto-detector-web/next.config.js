// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  // Ensure compatibility with TypeScript and React versions
  experimental: {
    // Remove any experimental features that might cause issues
    // with the downgraded versions
  }
}

module.exports = nextConfig

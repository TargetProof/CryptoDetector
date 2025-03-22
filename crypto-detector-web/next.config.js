/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  
  // This tells Next.js that some routes are intentionally dynamic
  experimental: {
    allowDynamicRoutes: true,
    appDir: true,
  },
  
  // Optional: Configure image domains if you're using next/image
  images: {
    domains: ['example.com'],
  },
  
  // Optional: Add environment variables that should be available at build time
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://crypto-detector.azurewebsites.net'
  },
  
  // Optional: Configure redirects if needed
  async redirects()  {
    return [];
  },
  
  // Optional: Configure headers if needed
  async headers() {
    return [];
  },

  // Add this line to specify the base directory
  basePath: '/src',

  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
};

const path = require('path');

module.exports = nextConfig;

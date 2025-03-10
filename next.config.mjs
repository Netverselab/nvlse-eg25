/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.brave.com'],
  },
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;

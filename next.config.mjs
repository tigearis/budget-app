/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['img.clerk.com'],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['@apollo/client'],
  },
}

export default nextConfig

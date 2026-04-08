const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'standalone' enables optimised self-hosted deployment
  // This is correct for VPS deployment with PM2
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'ecove.com.ng', '*.vercel.app'],
    },
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'X-XSS-Protection',         value: '1; mode=block' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/vendor/dashboard', permanent: false },
      { source: '/seller',    destination: '/vendor/register',  permanent: false },
      { source: '/apply',     destination: '/vendor/register',  permanent: false },
    ]
  },
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  disableLogger: true,
  widenClientFileUpload: true,
  transpileClientSDK: false,
  tunnelRoute: '/monitoring-tunnel',
  hideSourceMaps: true,
  reactComponentAnnotation: { enabled: true },
})

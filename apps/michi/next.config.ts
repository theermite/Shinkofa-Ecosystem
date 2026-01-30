import type { NextConfig } from 'next'
import path from 'path'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Enable standalone output for Docker
  output: 'standalone',

  // Disable telemetry
  eslint: {
    ignoreDuringBuilds: false,
  },

  typescript: {
    // TypeScript errors are now properly checked during build
    ignoreBuildErrors: false,
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app.shinkofa.com',
    NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL || 'https://app.shinkofa.com',
    NEXT_PUBLIC_API_SHIZEN_URL: process.env.NEXT_PUBLIC_API_SHIZEN_URL || 'https://app.shinkofa.com',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://app.shinkofa.com/ws',
  },

  // Image optimization
  images: {
    domains: ['localhost', 'app.shinkofa.com', 'shinkofa.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Webpack configuration for submodule widgets
  webpack: (config, { isServer }) => {
    // Resolve modules from the main app's node_modules for submodule imports
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules',
    ]

    // Add alias for ermite widgets
    config.resolve.alias = {
      ...config.resolve.alias,
      '@ermite-widgets': path.resolve(__dirname, '../toolbox-theermite/widgets'),
    }

    return config
  },
}

export default withNextIntl(nextConfig)

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    disableStaticImages: false,
    domains: ['*'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ]
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg)$/i,
      type: 'asset/resource'
    });
    return config;
  },
  output: 'standalone',
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose'],
    disableOptimizedLoading: true,
    optimizeCss: false
  },
  reactStrictMode: true,
  staticPageGenerationTimeout: 180,
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
  distDir: '.next',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
};

module.exports = nextConfig; 
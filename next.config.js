/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      path: false,
      os: false,
      zlib: false,
      http: false,
      https: false,
      buffer: false,
      process: false,
    };
    return config;
  },
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@coral-xyz/anchor'],
  },
}

module.exports = nextConfig 
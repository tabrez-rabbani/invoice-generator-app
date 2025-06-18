/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Enable content-aware image resizing
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Configure webpack to handle MongoDB's dependencies
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js modules on the client to prevent issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        dns: false,
        net: false,
        tls: false,
        crypto: false,
        path: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        util: false,
      };
    }

    // Optimize JS bundle size
    config.optimization.minimize = true;

    return config;
  },
  // Enable compression
  compress: true,
  // SWC minification is enabled by default in Next.js 15+
  // Enable React strict mode for better performance and fewer bugs
  reactStrictMode: true,
  // Optimize production builds
  productionBrowserSourceMaps: false,
  // Configure headers for better caching
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico|/).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

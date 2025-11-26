/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'components', 'hooks', 'lib']
  },
  experimental: {
    typedRoutes: true,
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
    // Dodatkowe optymalizacje wydajności
    serverComponentsExternalPackages: ['mysql2'],
    optimizeCss: true,
    scrollRestoration: true,
  },
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 300, // Zwiększono cache obrazów do 5 minut
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
    // Dodatkowe optymalizacje kompilatora
    styledComponents: true,
  },
  // Optymalizacje dla lepszej wydajności
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // Zwiększono do 60 sekund
    pagesBufferLength: 5, // Zwiększono bufor stron
  },
  // Optymalizacje pamięci i wydajności
  swcMinify: true,
  generateEtags: true, // Włączono ETags dla lepszego cache'owania
  httpAgentOptions: {
    keepAlive: true, // Włączono keep-alive dla lepszej wydajności
  },
  // Optymalizacje bundle'a
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optymalizacje dla produkcji
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: 'mui',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  // Security headers (CSP with nonce is handled in middleware.ts)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

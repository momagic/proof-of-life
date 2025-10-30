/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // Enable standalone output for Docker deployment
  // NOTE: For local Windows development, comment out the line below to avoid symlink issues
  // Use ENABLE_STANDALONE=true for deployment builds (avoids Windows symlink issues locally)
  output: process.env.ENABLE_STANDALONE === 'true' ? 'standalone' : undefined,
  
  // File tracing configuration for standalone builds (only when standalone is enabled)
  // NOTE: For local Windows development, comment out this section to avoid symlink issues
  ...(process.env.ENABLE_STANDALONE === 'true' && {
    outputFileTracingRoot: process.cwd(),
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  }),
  
  // Experimental features
  experimental: {
    // Additional experimental features can be added here
  },
  
  // Enable static exports for better CDN compatibility
  trailingSlash: false,
  
  // Image optimization settings
  images: {
    // Always disable optimization for CDN images
    unoptimized: true,
  },
  
  // Headers for better caching and World App compatibility
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; script-src 'self' 'unsafe-eval' 'unsafe-inline' data: blob:; style-src 'self' 'unsafe-inline' data: blob:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: wss: data: blob: https://worldchain-mainnet.g.alchemy.com https://worldchain.org wss://worldchain-mainnet.g.alchemy.com;",
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable, s-maxage=31536000',
          },
        ],
      },
    ];
  },

  // Webpack configuration to handle Windows symlink issues
  webpack: (config, { isServer }) => {
    // Disable symlinks resolution to prevent Windows permission issues
    config.resolve.symlinks = false;
    
    // For standalone builds, ensure proper file copying instead of symlinking
    if (isServer && process.platform === 'win32') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    return config;
  },
};

module.exports = nextConfig;
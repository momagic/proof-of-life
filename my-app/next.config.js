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
  // Explicitly disable standalone mode for Coolify deployment
  // Use standard Next.js build for better compatibility
  // output: 'standalone', // Disabled for Coolify deployment
  
  // Environment-based configuration
  ...(process.env.ENABLE_STANDALONE === 'false' && {
    // Standard build configuration for deployment
  }),
};

module.exports = nextConfig;
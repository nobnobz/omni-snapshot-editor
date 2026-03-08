import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Disable server-optimized images since GitHub Pages is static
  images: { unoptimized: true },
  basePath: '/omni-snapshot-editor',
  trailingSlash: true,
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
};

export default nextConfig;

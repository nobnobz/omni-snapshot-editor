import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Disable server-optimized images since GitHub Pages is static
  images: { unoptimized: true },
  basePath: '/omni-snapshot-editor',
};

export default nextConfig;

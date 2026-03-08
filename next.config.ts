import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Disable server-optimized images since GitHub Pages is static
  images: { unoptimized: true },
  // Note: if you change your repository name to something other than username.github.io,
  // you might need to add: basePath: '/your-repo-name'
};

export default nextConfig;

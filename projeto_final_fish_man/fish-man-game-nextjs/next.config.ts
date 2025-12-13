import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Enables static exports
  basePath: '/cg-2025-02', // Replace with your repository name (e.g., '/my-portfolio')
  assetPrefix: '/cg-2025-02/', // Required for correct asset loading
  images: {
    unoptimized: true, // GitHub Pages does not support Next.js image optimization
  },
};

export default nextConfig;

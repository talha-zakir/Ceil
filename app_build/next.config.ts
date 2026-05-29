import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    // Fix Next.js 16.2+ build crash with invariant error: Expected workStore to be initialized
    // @ts-ignore
    maximumDiskCacheSize: 0,
  },
  // Tauri compatibility: disable server-side features for static export
  trailingSlash: true,
};

export default nextConfig;

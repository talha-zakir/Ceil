import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Tauri compatibility: disable server-side features for static export
  trailingSlash: true,
};

export default nextConfig;

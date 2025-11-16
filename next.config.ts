import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      os: false,
      path: false,
    };
    return config;
  },
  turbopack: {},
};

export default nextConfig;

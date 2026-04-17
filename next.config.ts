import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpackDevMiddleware: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // Force HMR to use localhost
  assetPrefix: process.env.NODE_ENV === "development" ? "http://localhost:3000" : undefined,
};

export default nextConfig;

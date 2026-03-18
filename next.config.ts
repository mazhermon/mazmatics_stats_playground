import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three", "d3"],
  serverExternalPackages: ["better-sqlite3"],
  outputFileTracingIncludes: {
    '/api/**': ['./src/data/*.db'],
  },
};

export default nextConfig;

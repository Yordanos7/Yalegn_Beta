import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  output: "standalone", // Enable standalone output for Docker deployment
  typescript: {
    // Skip TypeScript checking during production builds
    ignoreBuildErrors: process.env.NODE_ENV === "production",
  },
  eslint: {
    // Skip ESLint during production builds
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },
  transpilePackages:
    process.env.NODE_ENV === "production"
      ? []
      : [
          "@my-better-t-app/db",
          "@my-better-t-app/api",
          "@my-better-t-app/auth",
        ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;

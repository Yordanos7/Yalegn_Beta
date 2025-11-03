import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  transpilePackages: [
    "@my-better-t-app/db",
    "@my-better-t-app/api",
    "@my-better-t-app/auth",
  ],
};

export default nextConfig;

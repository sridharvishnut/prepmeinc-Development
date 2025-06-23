import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-firebase-hooks'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

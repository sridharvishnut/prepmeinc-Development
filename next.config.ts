import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['react-firebase-hooks'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['node-fetch', 'p-queue', '@dqbd/tiktoken', 'dotenv'],
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Polyfill Node.js modules for the client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        http: false,
        https: false,
        buffer: false,
      };
    }

    return config;
  },
};

export default nextConfig;

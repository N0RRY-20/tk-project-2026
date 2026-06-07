import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },

  reactCompiler: true,
  serverExternalPackages: [
    "better-auth",
    "kysely",
    "@better-auth/kysely-adapter",
    "sharp",
  ],
};

export default nextConfig;

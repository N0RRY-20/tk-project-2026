import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["better-auth", "kysely", "@better-auth/kysely-adapter"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["stripe", "ioredis"],
};

export default nextConfig;

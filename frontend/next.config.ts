import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Silence multi-lockfile root inference warnings in monorepo-like setups
  outputFileTracingRoot: path.resolve(__dirname, ".."),
};

export default nextConfig;

import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@repo/ui"],
  poweredByHeader: false,
};
export default config;

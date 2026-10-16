import type { NextConfig } from "next";

const config: NextConfig = {
  transpilePackages: ["@repo/ui", "@repo/database"],
  poweredByHeader: false,
};

export default config;

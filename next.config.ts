import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set root to this project directory so Turbopack doesn't
    // walk up to a parent that has its own lockfile (e.g. ~/pnpm-lock.yaml).
    root: path.resolve(__dirname),
  },
  // Silence noisy logging in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;

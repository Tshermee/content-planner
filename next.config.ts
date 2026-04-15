import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/content-planner",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

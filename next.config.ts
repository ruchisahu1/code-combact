import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/user/gamified/Game-Coder",
  assetPrefix: "/user/gamified/Game-Coder",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  turbopack: { root: process.cwd() },
  allowedDevOrigins: [
    "127.0.0.1",
    "athletes-unknown-crew-demonstration.trycloudflare.com",
  ],
};

export default nextConfig;

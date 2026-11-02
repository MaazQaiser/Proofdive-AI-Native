import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // DESIGN.md, readable on the site: the repo-root DESIGN.md rendered to
  // public/design-md.html, served at a clean address the way /design-system is.
  // A plain array runs after public files and before dynamic routes, so the
  // rewrite lands on the static file.
  async rewrites() {
    return [
      { source: "/design-md", destination: "/design-md.html" },
      { source: "/design.md", destination: "/design-md.html" },
    ];
  },
};

export default nextConfig;

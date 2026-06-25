import type { NextConfig } from "next";

// Base path for deployment under a sub-path (e.g. GitHub Pages project site at
// https://<user>.github.io/vault). Empty in local dev so the app serves at "/".
// The CI workflow sets NEXT_PUBLIC_BASE_PATH from the Pages action, which emits
// "/<repo>" for project sites and "/" for root sites (which Next.js disallows).
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const basePath = rawBasePath === "/" ? "" : rawBasePath.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Produce a fully static site in `out/` so it can be hosted on GitHub Pages.
  output: "export",
  // Prefix routes and assets when served from a sub-path.
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  // The default image optimizer needs a server, which static export cannot use.
  images: { unoptimized: true },
  // Emit `route/index.html` files so static hosts resolve clean URLs.
  trailingSlash: true,
};

export default nextConfig;

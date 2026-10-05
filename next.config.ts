import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ["@libsql/client", "libsql"],
  // Demo mode builds its database from the migration SQL at start-up, so ship that folder with every route.
  outputFileTracingIncludes: {
    "/*": ["./drizzle/**/*"],
    "/**/*": ["./drizzle/**/*"],
  },
  images: {
    // Placeholder photography is served by Unsplash's image CDN (resized there via a custom
    // loader in <Photo>). Official BAA photography uploaded later can use next/image as normal.
    remotePatterns: [new URL("https://images.unsplash.com/**")],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Legacy baa.bh (Wix) URLs → new information architecture
    return [
      { source: "/blog", destination: "/news", permanent: true },
      { source: "/post/:slug", destination: "/news", permanent: true },
      { source: "/board-members", destination: "/about/board", permanent: true },
      { source: "/anti-doping", destination: "/clean-athletics", permanent: true },
      { source: "/about-7", destination: "/clean-athletics/code-of-conduct", permanent: true },
      { source: "/copy-of-code-of-conduct", destination: "/clean-athletics/anti-doping-rules", permanent: true },
      { source: "/copy-of-anti-doping-rules", destination: "/clean-athletics/check-your-medication", permanent: true },
      { source: "/copy-of-check-your-medication", destination: "/clean-athletics/supplements-policy", permanent: true },
      { source: "/copy-of-supplements-policy", destination: "/clean-athletics/therapeutic-use-exemptions", permanent: true },
      { source: "/violations", destination: "/clean-athletics/ineligible", permanent: true },
      { source: "/copy-of-supplements-policy-1", destination: "/clean-athletics/whistleblowing", permanent: true },
      { source: "/copy-of-clean-athletics", destination: "/clean-athletics/report-doping", permanent: true },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const securityHeaders = [
  // Force HTTPS for two years, including subdomains (browsers ignore this over plain http).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // Same-origin only: other sites cannot embed our resources. No CORS headers are sent anywhere.
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // The Content-Security-Policy (with a per-request nonce) is set in src/proxy.ts.
];

const nextConfig: NextConfig = {
  poweredByHeader: false, // do not advertise the framework
  productionBrowserSourceMaps: false, // never ship source maps to visitors
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
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

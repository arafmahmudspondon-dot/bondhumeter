import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // "standalone" is only useful for self-hosting (bun run start).
  // On Vercel we let the platform handle the output.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  compress: true,
  poweredByHeader: false,
  // Share-card fonts must ship INSIDE the /api/og serverless function
  // (public/ assets are not readable from the lambda filesystem).
  outputFileTracingIncludes: {
    "/api/og": ["./public/fonts/**/*"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  /* Security headers on every response */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
      {
        /* OG images are immutable per quiz — cache them hard for fast shares */
        source: "/api/og",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;

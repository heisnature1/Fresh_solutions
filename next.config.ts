import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native/WASM packages out of the webpack bundle — loaded by Node at runtime.
  serverExternalPackages: [
    "@electric-sql/pglite",
    "pg",
    "nodemailer",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "sharp",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

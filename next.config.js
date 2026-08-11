/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Allow school logo / future avatar uploads from the configured storage bucket.
      // Replace with your actual R2/S3 hostname once provisioned.
      { protocol: "https", hostname: "**.r2.dev" },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb", // headroom for logo/PDF-related uploads
    },
  },
};

module.exports = nextConfig;

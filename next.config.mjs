/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : undefined,
  serverExternalPackages: ["@remotion/renderer"],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

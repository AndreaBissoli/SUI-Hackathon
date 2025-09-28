/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lorenzomoni.com",
      },
    ],
  },
};

export default nextConfig;

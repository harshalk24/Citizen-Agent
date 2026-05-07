/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Silence Prisma optional peer dep warnings during build
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({ "@prisma/client": "@prisma/client" });
    }
    return config;
  },

  images: {
    remotePatterns: [],
  },
};

export default nextConfig;

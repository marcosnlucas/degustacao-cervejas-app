/** @type {import('next').NextConfig} */
const nextConfig = {
  serverComponentsExternalPackages: ['@prisma/client', '@prisma/extension-accelerate'],
};

module.exports = nextConfig;


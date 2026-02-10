/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  serverExternalPackages: ["pino-pretty", "encoding"],
};

module.exports = nextConfig;

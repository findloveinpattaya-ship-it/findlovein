/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true,
    serverActions: true,
  },
  output: undefined, // ⚠️ se 'export', se 'standalone' — ez a kulcs!
};

export default nextConfig;

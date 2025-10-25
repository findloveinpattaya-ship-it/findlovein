/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    appDir: true, // 👉 KÉNYSZERÍTI az app/ router használatát
    serverActions: true,
  },
  output: "standalone",
};

export default nextConfig;

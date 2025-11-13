// next.config.mjs
import 'dotenv/config'; // подключает .env
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  experimental: {
    externalDir: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: (process.env.NEXT_PUBLIC_API_ENDPOINT || "").replace(
          /http[s*]?:\/\//,
          ""
        ),
      },
      { hostname: "127.0.0.1", protocol: "http" },
      { hostname: "invest-space-strapi.webtm.ru", protocol: "http" },
      { hostname: "proverka-kaperov.ru", protocol: "https" },
    ],
  },
};

export default nextConfig;
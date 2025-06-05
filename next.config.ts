import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        has: [{ type: "host", value: "observatudo.com.br" }],
        destination: "https://www.observatudo.com.br",
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\.json$/], // garante exposição correta do SW
  runtimeCaching: [
    {
      urlPattern: /\/api\/indicadores/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "indicadores-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 3600, // 1 hora
        },
      },
    },
    {
      urlPattern: /\/api\/localidades/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "localidades-cache",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 86400, // 1 dia
        },
      },
    },
    {
      urlPattern: /\/api\/categorias/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "categorias-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 86400, // 1 dia
        },
      },
    },
    {
      urlPattern: /^https?.*/, // fallback genérico
      handler: "NetworkFirst",
      options: {
        cacheName: "offline-cache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);

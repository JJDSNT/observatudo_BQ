import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  extendDefaultRuntimeCaching: false, // ⛔ evita _ref
  workboxOptions: {
    runtimeCaching: [
      {
        urlPattern: /^\/_next\/image\?.*$/,
        handler: "NetworkOnly", // ✅ evita erro 400
      },
      {
        urlPattern: /^https:\/\/lh3\.googleusercontent\.com\/.*$/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-avatars-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
      {
        urlPattern: /\/api\/indicadores/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "indicadores-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 3600,
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
            maxAgeSeconds: 86400,
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
            maxAgeSeconds: 86400,
          },
        },
      },
      {
        urlPattern: /^https?.*/,
        handler: "NetworkFirst",
        options: {
          cacheName: "offline-cache",
          expiration: {
            maxEntries: 200,
          },
          networkTimeoutSeconds: 3,
        },
      },
    ],
  },
});

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

export default withPWA(nextConfig);

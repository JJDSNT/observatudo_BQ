import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'observatudo.com.br' }],
        destination: 'https://www.observatudo.com.br',
        permanent: true,
      },
    ];
  },
  
};

export default nextConfig;

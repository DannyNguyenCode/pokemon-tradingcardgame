import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // keep any other settings you already have
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**', // wildcard all sprite paths
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        pathname: '/PokeAPI/sprites/**', // wildcard all sprite paths
      }
    ],
  },
  devIndicators: false
};

export default nextConfig;

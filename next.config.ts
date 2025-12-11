import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import path from "path";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // REQUIRED FIX — disable Turbopack completely.
  // WalletConnect + Privy + Pino + Thread-stream WILL NOT build under Turbo.
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-dialog"
    ],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Prevent Pino from being bundled in browser builds
  serverExternalPackages: ["pino", "pino-pretty", "thread-stream"],

  webpack(config) {
    // --- FIX #1: Ignore ALL test files inside ANY node_modules ---
    // config.module.rules.push({
    //   test: /thread-stream\/test\/indexes\.js$/,
    //   use: "ignore-loader",
    // });

    // --- FIX #2: Prevent optional test-only deps from resolving ---
    config.resolve.alias = {
      ...config.resolve.alias,
      tape: false,
      "why-is-node-running": false,
      "real-require": false,
      "pino-pretty": false,
      "lokijs": false,
      "encoding": false,
      "pino-elasticsearch": false,
    };

    config.resolve.fallback = {
      ...config.resolve.fallback,
      // fallback is still needed for some polyfills
      fs: false,
      net: false,
      tls: false,
    };

    // --- FIX #3: Silence nested warnings from Privy + WalletConnect ---
    config.ignoreWarnings = [
      { module: /thread-stream\/test/ },
      { module: /@walletconnect\/.*\/thread-stream\/test/ },
      { module: /@privy-io\/.*\/thread-stream\/test/ },
    ];

    return config;
  },

  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "img.youtube.com", pathname: "/**" },
      { protocol: "https", hostname: "coin-images.coingecko.com", pathname: "/**" },
      { protocol: "https", hostname: "assets.coingecko.com", pathname: "/**" },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
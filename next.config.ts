import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const isDev = process.env.NODE_ENV !== "production";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: isDev,
  register: !isDev,
  skipWaiting: true,
});

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
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

  // Turbopack-specific config: stub out pino/thread-stream so Turbopack
  // does NOT try to resolve or bundle them (they are server-only Node
  // logging libs dragged in by @walletconnect/logger). Multiple nested
  // copies exist at incompatible versions (0.15.2 vs 3.1.0 vs 4.0.0)
  // which makes serverExternalPackages fail and causes 4GB memory usage.
  turbopack: {
    resolveAlias: {
      // Stub these server-only packages to empty modules in the browser bundle
      "pino": { browser: "./empty-module.js" },
      "pino-pretty": { browser: "./empty-module.js" },
      "thread-stream": { browser: "./empty-module.js" },
    },
    rules: {
      // Ignore .ts test files inside thread-stream (no loader configured for them)
      "node_modules/**/thread-stream/test/**/*.ts": {
        loaders: [],
        as: "*.js",
      },
    },
  },

  webpack(config, { isServer }) {
    // --- FIX #1: Ignore ALL test files inside thread-stream ---
    config.module.rules.push({
      test: /thread-stream\/test\/.*\.(js|ts)$/,
      use: "null-loader",
    });

    // --- FIX #2: Prevent optional/unused deps from resolving ---
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-elasticsearch": false,
      tape: false,
      "why-is-node-running": false,
      "real-require": false,
      "lokijs": false,
      "encoding": false,
      "@react-native-async-storage/async-storage": false,
    };

    // Stub pino/thread-stream on client side only (server can use real ones)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "pino": false,
        "pino-pretty": false,
        "thread-stream": false,
      };
    }

    // --- FIX #3: Silence nested warnings from WalletConnect ---
    config.ignoreWarnings = [
      { module: /thread-stream\/test/ },
      { module: /@walletconnect\/.*\/thread-stream\/test/ },
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
      { protocol: "https", hostname: "raw.githubusercontent.com", pathname: "/**" },
      { protocol: "https", hostname: "cryptologos.cc", pathname: "/**" },
    ],
    localPatterns: [
      {
        pathname: '/**',
      },
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

export default withNextIntl(withPWA(nextConfig));
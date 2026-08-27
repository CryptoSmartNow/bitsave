import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const isDev = process.env.NODE_ENV !== "production";

const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "test", // Temporarily enabled in dev for testing push
  register: true,
  skipWaiting: true,
});

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Produce lean standalone bundle to save 50%+ RAM on constrained containers (Render 512MB)
  output: "standalone",
  poweredByHeader: false,
  allowedDevOrigins: ['8460-105-116-13-202.ngrok-free.app'],
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-popover",
      "hugeicons-react",
      "@rainbow-me/rainbowkit",
      "date-fns"
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
    // Disable CPU & RAM intensive server-side on-the-fly image transcoding on Render
    unoptimized: true,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

  async rewrites() {
    return [
      {
        source: "/docs",
        destination: "https://proxy.gitbook.site/sites/site_qixqW",
      },
      {
        source: "/docs/:path*",
        destination: "https://proxy.gitbook.site/sites/site_qixqW/:path*",
      },
      {
        source: "/wrapped",
        destination: "https://bitsave-wrapped.vercel.app",
      },
      {
        source: "/wrapped/:path*",
        destination: "https://bitsave-wrapped.vercel.app/:path*",
      },
    ];
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

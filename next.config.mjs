import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stubPath = path.resolve(__dirname, 'src/config/wagmi-tempo-stub.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    config.resolve.alias = {
      ...config.resolve.alias,
      '@wagmi/core/tempo': stubPath,
      '@base-org/account': stubPath,
      '@coinbase/cdp-sdk': stubPath,
      '@solana/kit': stubPath,
      '@gemini-wallet/core': stubPath,
      '@safe-global/safe-apps-sdk': stubPath,
      '@safe-global/safe-apps-provider': stubPath,
      '@metamask/connect-evm': stubPath,
      porto: stubPath,
      'porto/internal': stubPath,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

export default nextConfig;

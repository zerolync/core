/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@zerolync/passkey-core', '@zerolync/passkey-solana', '@zerolync/passkey-sui'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };

      config.plugins.push(
        new (require('webpack')).DefinePlugin({
          'global': 'globalThis',
        })
      );
    }
    return config;
  },
};

module.exports = nextConfig;

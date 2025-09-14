/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo estrito do React para desenvolvimento
  reactStrictMode: true,
  
  // Configurações de imagem
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pnfpcytrpuvhjzrmtbwy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Configurações de webpack para desenvolvimento
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Configurações básicas de otimização para desenvolvimento
      if (config.optimization && config.optimization.splitChunks) {
        config.optimization.splitChunks.cacheGroups = {
          ...config.optimization.splitChunks.cacheGroups,
          default: {
            ...config.optimization.splitChunks.cacheGroups.default,
            enforce: true,
          },
        };
      }
    }
    return config;
  },
};

module.exports = nextConfig;

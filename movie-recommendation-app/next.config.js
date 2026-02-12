const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

/** @type {import('next').NextConfig} */
const baseConfig = {
  images: {
    domains: ['image.tmdb.org'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
  },
};

/**
 * IMPORTANT:
 * Use different build output directories for dev vs prod build.
 * This prevents `next build` from overwriting the dev server's `.next` artifacts,
 * which can cause missing `/_next/static/*` assets (unstyled UI).
 */
module.exports = (phase) => {
  const distDir = phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next';
  return {
    ...baseConfig,
    distDir,
  };
};









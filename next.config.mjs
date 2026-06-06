import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default withPWA({
  dest: 'public',
  register: false,          // We register manually in layout.tsx for full control
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',  // Skip SW in dev to avoid confusion
  buildExcludes: [/middleware-manifest\.json$/],
  publicExcludes: ['!sw.js'],  // Keep our hand-written sw.js
})(nextConfig);

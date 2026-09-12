const isDevelopment = process.env.NODE_ENV === 'development';
const deploymentId = process.env.DEPLOYMENT_VERSION;

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self' https://ipapi.co",
  "font-src 'self'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "img-src 'self' blob: data:",
  "media-src 'none'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel sets VERCEL=1 and does not use standalone output. Leaving it on
  // with Vercel's Next.js adapter can fail looking for next-server.js.nft.json.
  output: process.env.VERCEL ? undefined : 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  ...(deploymentId ? { deploymentId } : {}),
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

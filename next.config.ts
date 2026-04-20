import type {NextConfig} from 'next';

const starterCsp = [
  "default-src 'self' https: data: blob:",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: http: ws: wss:",
  "frame-src 'self' https:",
  "media-src 'self' https: data: blob:",
].join('; ');

const cspReportEndpoint = '/api/csp-report';
const cspReportOnly = [
  "default-src 'self' https: data: blob:",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' https: blob:",
  "style-src 'self' 'unsafe-inline' https:",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https:",
  "media-src 'self' https: data: blob:",
  `report-uri ${cspReportEndpoint}`,
  'report-to csp-endpoint',
].join('; ');

const cspReportTo = JSON.stringify({
  group: 'csp-endpoint',
  max_age: 10886400,
  endpoints: [{ url: cspReportEndpoint }],
  include_subdomains: true,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/bike-delivery-rider-gear',
        destination: '/safety-gear',
        permanent: true,
      },
      {
        source: '/bike-delivery-tech-and-visibility',
        destination: '/tech-lighting',
        permanent: true,
      },
      {
        source: '/bike-security-for-delivery-riders',
        destination: '/bike-security',
        permanent: true,
      },
      {
        source: '/delivery-rider-equipment',
        destination: '/delivery-gear',
        permanent: true,
      },
      {
        source: '/delivery-platform-reviews',
        destination: '/platform-reviews',
        permanent: true,
      },
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'ridercomplex.com' }],
        destination: 'https://www.ridercomplex.com/:path*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: starterCsp },
          { key: 'Content-Security-Policy-Report-Only', value: cspReportOnly },
          { key: 'Report-To', value: cspReportTo },
          { key: 'Reporting-Endpoints', value: `csp-endpoint=\"${cspReportEndpoint}\"` },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow access to remote image placeholder.
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // This allows any path under the hostname
      },
      {
        protocol: 'https',
        hostname: 'www.ebike24.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  transpilePackages: ['motion'],
  webpack: (config, {dev}) => {
    // HMR is disabled in AI Studio via DISABLE_HMR env var.
    // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = {
        ignored: /.*/,
      };
    }
    return config;
  },
};

export default nextConfig;

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
        source: '/platform-reviews/what-pays-more-uber-eats-or-doordash',
        destination: '/platform-reviews/what-pays-more-uber-eats-or-doordash-2026-breakdown',
        permanent: true,
      },
      {
        source: '/delivery-gear/insulated-bag-for-food-delivery-review-cheap-to-pro-grade-guide-for-riders',
        destination: '/delivery-gear/insulated-food-delivery-bag-review-cheap-to-pro-grade',
        permanent: true,
      },
      {
        source: '/tech-lighting/motorcycle-tail-lights-review-best-led-upgrades-for-delivery-riders-usa',
        destination: '/tech-lighting/best-motorcycle-tail-lights-for-delivery-riders-led-picks',
        permanent: true,
      },
      {
        source: '/tech-lighting/motorcycle-wheel-lights-review-cheap-highimpact-visibility-upgrades-for-delivery-riders',
        destination: '/tech-lighting/motorcycle-wheel-lights-best-picks-for-delivery-riders',
        permanent: true,
      },
      {
        source: '/tech-lighting/motorcycle-helmet-light-review-best-helmet-mounted-led-light-for-night-delivery-riders',
        destination: '/tech-lighting/motorcycle-helmet-light-review-best-picks-for-night-delivery',
        permanent: true,
      },
      {
        source: '/tech-lighting/how-to-replace-motorcycle-license-plate-light-quick-diy-guide-for-delivery-riders-led-replacement-legal-tips',
        destination: '/tech-lighting/motorcycle-license-plate-light-diy-replacement-guide',
        permanent: true,
      },
      {
        source: '/tech-lighting/best-motorcycle-auxiliary-lights-for-delivery-riders-improve-visibility-and-safety-night-riding',
        destination: '/tech-lighting/motorcycle-auxiliary-lights-best-picks-for-delivery',
        permanent: true,
      },
      {
        source: '/tech-lighting/best-motorcycle-auxiliary-lights-for-delivery-riders-improve-visibility-and-safety-night-riding/',
        destination: '/tech-lighting/motorcycle-auxiliary-lights-best-picks-for-delivery',
        permanent: true,
      },
      {
        source: '/tech-lighting/how-to-install-motorcycle-strip-lights-led-strip-lights-for-motorcycle-underglow-a-delivery-riders-stepbystep-guide',
        destination: '/tech-lighting/motorcycle-strip-lights-install-guide-for-delivery-riders',
        permanent: true,
      },
      {
        source: '/tech-lighting/best-motorcycle-lights-for-delivery-riders-motorcycle-lighting-for-night-delivery-guide',
        destination: '/tech-lighting/best-motorcycle-lights-for-delivery-riders-night-guide',
        permanent: true,
      },
      {
        source: '/best-motorcycle-lights-for-delivery-riders-motorcycle-lighting-for-night-delivery-guide/',
        destination: '/tech-lighting/best-motorcycle-lights-for-delivery-riders-night-guide',
        permanent: true,
      },
      {
        source: '/tech-lighting/motorcycle-number-plate-light-review-quick-compliant-led-replacements-for-delivery-riders-usa',
        destination: '/tech-lighting/motorcycle-number-plate-light-best-led-picks-for-delivery',
        permanent: true,
      },
      {
        source: '/tech-lighting/motorcycle-light-bar-review-best-front-lighting-upgrades-for-delivery-riders',
        destination: '/tech-lighting/motorcycle-light-bar-review-best-front-lighting-for-delivery',
        permanent: true,
      },
      {
        source: '/safety-gear/how-to-choose-leather-motorcycle-gloves-for-delivery-riders-2025-buying-guide',
        destination: '/safety-gear/leather-vs-textile-motorbike-gloves-delivery-rider-guide',
        permanent: true,
      },
      {
        source: '/bike-security/bicycle-u-lock-review-for-delivery-riders-u-lock-vs-chain-lock-which-is-better',
        destination: '/bike-security/bicycle-u-lock-vs-chain-lock-which-is-better-for-delivery',
        permanent: true,
      },
      {
        source: '/bike-security/bike-u-lock-the-best-u-locks-for-delivery-riders-gig-workers-and-everyday-bike-security',
        destination: '/bike-security/best-bike-u-lock-for-delivery-riders-2026-buying-guide',
        permanent: true,
      },
      {
        source: '/category/bike-delivery-tech-and-visibility',
        destination: '/tech-lighting',
        permanent: true,
      },
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
      {
        protocol: 'https',
        hostname: 'cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'm.media-amazon.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aventon-images.imgix.net',
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

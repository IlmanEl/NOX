/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // PWA optimization
  poweredByHeader: false,
  compress: true,
  // Disable dev indicators (removes the N button)
  devIndicators: {
    appIsrIndicator: false,
    buildActivity: false,
  },
}

export default nextConfig

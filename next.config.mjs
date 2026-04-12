const isProd = process.env.NODE_ENV === 'production';
const internalHost = process.env.TAURI_DEV_HOST || 'localhost';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next.js uses SSG instead of SSR in production
  output: isProd ? 'export' : undefined,
  // Required to use the Next.js Image component in SSG mode
  images: {
    unoptimized: true,
  },
  // Configure assetPrefix or else the server won't properly resolve your assets
  assetPrefix: isProd ? undefined : `http://${internalHost}:3000`,
};

export default nextConfig;

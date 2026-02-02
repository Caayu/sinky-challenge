import createNextIntlPlugin from 'next-intl/plugin';
 
const withNextIntl = createNextIntlPlugin();
 
/** @type {import('next').NextConfig} */
const nextConfig = {
  // allowedDevOrigins: ['http://localhost:3000'], // Removed hardcoded origin
  output: 'standalone',
};
 
export default withNextIntl(nextConfig);

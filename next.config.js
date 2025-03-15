/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer-extra', 
      'puppeteer-extra-plugin-stealth',
      'puppeteer-extra-plugin-recaptcha',
      'puppeteer-extra-plugin-adblocker'
    ],
  },
};

module.exports = nextConfig;

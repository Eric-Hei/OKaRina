/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '',
  assetPrefix: '',
  images: {
    domains: [],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: 'okarina-app',
  },
}

module.exports = nextConfig

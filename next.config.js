/** @type {import('next').NextConfig} */
const nextConfig = {
  // Retirer output: 'export' pour utiliser le mode serveur avec Netlify
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: 'oskar-app',
  },
}

module.exports = nextConfig

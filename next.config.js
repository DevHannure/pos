/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        unoptimized: true,
        domains: ['giinfotech.ae','static.giinfotech.ae','tripadvisor.com'],
    }
}

module.exports = nextConfig

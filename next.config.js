/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    images: {
        unoptimized: true,
        domains: ['giinfotech.ae','static.giinfotech.ae','tripadvisor.com'],
    }
}

module.exports = nextConfig
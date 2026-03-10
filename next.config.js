/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: { unoptimized: true },
    basePath: '/omni-snapshot-editor',
    trailingSlash: true,
};

module.exports = nextConfig;

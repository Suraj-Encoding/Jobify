/** @type {import('next').NextConfig} */
const nextConfig = {
    // # Comment out the "output" for the clerk 'middleware'
    // output: "export", 
    trailingSlash: true,
    images: {
        unoptimized: true
    },
    eslint: {
        ignoreDuringBuilds: true
    },
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        return config;
    }
};

module.exports = nextConfig;

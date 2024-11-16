import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: false,
    async rewrites() {
        return [
            {
                source: "/os",
                destination: "/dist/index.html",
            },
        ];
    },
};

export default nextConfig;


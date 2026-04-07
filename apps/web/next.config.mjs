/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@happy-sac/db", "@happy-sac/ui", "@happy-sac/sunat", "@happy-sac/pdf"],
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;

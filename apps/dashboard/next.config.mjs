/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui"],
  output: "standalone",
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;

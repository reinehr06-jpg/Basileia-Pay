import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const internalApi =
      process.env.INTERNAL_API_URL ||
      process.env.BACKEND_URL ||
      'http://basileia_pay_back_pay:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${internalApi}/api/:path*`,
      },
      {
        source: '/sanctum/:path*',
        destination: `${internalApi}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;


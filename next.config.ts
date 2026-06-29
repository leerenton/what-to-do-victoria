import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "duhxszqyyzrbzrhwneey.supabase.co" },
    ],
  },
};

export default nextConfig;

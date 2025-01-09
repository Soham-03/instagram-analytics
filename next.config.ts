import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    LANGFLOW_BASE_URL: process.env.LANGFLOW_BASE_URL,
    LANGFLOW_API_TOKEN: process.env.LANGFLOW_API_TOKEN,
  }
};

export default nextConfig;

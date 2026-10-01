import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:postgres@129.152.23.114:5432/doha_exam_platform?sslmode=disable",
  },
};

export default nextConfig;

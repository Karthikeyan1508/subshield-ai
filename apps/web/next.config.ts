import type { NextConfig } from "next";

const config: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"], // dev pages opened via 127.0.0.1 need HMR/chunks allowed
};

export default config;

import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  MONGO_URI: string;

  JWT: {
    JWT_SECRET: string;
    JWT_ACCESS_EXPIRE: string;
    JWT_REFRESH_EXPIRE: string;
  };

  SERVER: {
    PORT: string;
    NODE_ENV: "development" | "production";
    API_VERSION: string;
  };

  LOG_LEVEL: string;

  RATE_LIMIT: {
    WINDOW: string;
    MAX_REQUESTS: string;
  };

  FRONTEND_URL: string;
}

const loadEnvVariables = (): EnvConfig => {
  const requiredEnvVariables: string[] = [
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_ACCESS_EXPIRE",
    "JWT_REFRESH_EXPIRE",
    "PORT",
    "NODE_ENV",
    "LOG_LEVEL",
    "RATE_LIMIT_WINDOW",
    "RATE_LIMIT_MAX_REQUESTS",
    "FRONTEND_URL",
    "API_VERSION",
  ];

  requiredEnvVariables.forEach((key) => {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable ${key}`);
    }
  });

  return {
    MONGO_URI: process.env.MONGO_URI as string,

    JWT: {
      JWT_SECRET: process.env.JWT_SECRET as string,
      JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE as string,
      JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE as string,
    },

    SERVER: {
      PORT: process.env.PORT as string,
      NODE_ENV: process.env.NODE_ENV as "development" | "production",
      API_VERSION: process.env.API_VERSION as string,
    },

    LOG_LEVEL: process.env.LOG_LEVEL as string,

    RATE_LIMIT: {
      WINDOW: process.env.RATE_LIMIT_WINDOW as string,
      MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS as string,
    },

    FRONTEND_URL: process.env.FRONTEND_URL as string,
  };
};

export const envVars = loadEnvVariables();
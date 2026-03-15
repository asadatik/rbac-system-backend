import express, { Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "dotenv/config";


import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import permissionRoutes from "./routes/permissions";


import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import { logger } from "./utils/logger";


import { connectDatabase, disconnectDatabase } from "./config/database";

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(helmet());

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true,             
}));



app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || "15") * 60 * 1000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
  message: "Too many requests, please try again later",
});
app.use(limiter);


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/permissions", permissionRoutes);
app.use(notFoundHandler);
app.use(errorHandler);


let server: ReturnType<typeof app.listen>;

async function startServer() {
  try {

    await connectDatabase();

    server = app.listen(PORT, () => {
      logger.info(` Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down...");
  server.close(async () => {
    await disconnectDatabase();
    logger.info("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down...");
  server.close(async () => {
    await disconnectDatabase();
    logger.info("Server closed");
    process.exit(0);
  });
});

export default app;
import express from "express";
import dotenv from "dotenv";
import { connectDB, disconnectDB } from "./src/database/db.js";
import authRoutes from "./src/routes/auth-routes.js";
import homeRoutes from "./src/routes/home-routes.js";
import imageRoutes from "./src/routes/image-routes.js";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();

// Connect To Database
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth/", authRoutes);
app.use("/api/", homeRoutes);
app.use("/api/image", imageRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

// Unhandled promise rejections (e.g. missing await on DB connect)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

// Uncaught synchronous exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(0);
});

// Cloud/container shutdown (Heroku, Docker, PM2...)
process.on("SIGTERM", () => {
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

// Local shutdown (Ctrl+C, nodemon restarts)
process.on("SIGINT", () => {
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

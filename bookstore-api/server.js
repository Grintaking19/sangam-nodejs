import express from "express";
import dotenv from "dotenv";
import { connectToDB } from "./src/database/db.js";
import bookRoutes from "./src/routes/book-routes.js";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Connect to our database
connectToDB();

// Middleware
app.use(express.json());

// Routes
app.use("/api/books", bookRoutes);

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
import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/database/db.js";
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

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});

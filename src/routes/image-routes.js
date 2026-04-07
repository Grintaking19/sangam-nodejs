import express from "express";
import { uploadImage, getAllImages } from "../controllers/image-controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// Only admin users can upload images
router.post("/upload", authMiddleware, adminMiddleware, uploadImage);

// Both admin and regular users can view all images
router.get("/", authMiddleware, getAllImages);

export default router;

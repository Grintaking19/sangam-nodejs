import express from "express";
import { uploadImage, getAllImages } from "../controllers/image-controllers.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
const router = express.Router();

// Only admin users can upload images
router.post("/upload", authMiddleware, adminMiddleware, uploadMiddleware.single("image"), uploadImage);

// Both admin and regular users can view all images
router.get("/get", authMiddleware, getAllImages);

export default router;

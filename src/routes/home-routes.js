import express from "express";
import  authMiddleware  from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import { homeController, userProfileController, adminDashboardController } from "../controllers/home-controllers.js";
const router = express.Router();

// Home route
router.get("/home", homeController);

// User profile route (Protected route, requires authentication)
router.get("/profile", authMiddleware, userProfileController);

// Admin dashboard route (Protected route, requires admin role)
router.get("/admin/dashboard", authMiddleware, adminMiddleware, adminDashboardController);

export default router;
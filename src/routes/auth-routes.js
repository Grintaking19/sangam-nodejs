import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  changePassword,
} from "../controllers/auth-controllers.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

// Change password
router.put("/change-password", authMiddleware, changePassword);

export default router;

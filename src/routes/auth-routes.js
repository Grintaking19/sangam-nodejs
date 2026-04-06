import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/auth-controllers.js";

const router = express.Router();

// Register a user
router.post("/register", registerUser);

// Login a user
router.post("/login", loginUser);

// Logout
router.post("/logout", logoutUser);

export default router;
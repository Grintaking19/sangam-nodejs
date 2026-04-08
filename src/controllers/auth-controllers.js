import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import handleBadRequest from "../utils/handleBadRequest.js";
import { validateRequiredFields } from "../utils/validateRequiredFields.js";
import { generateToken } from "../utils/generateToken.js";
import { getTimeInMilliseconds } from "../utils/getTimeInMilliseconds.js";
// REMOVE the role later (Set it to user by default and only admin manually from database)
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const missingFields = validateRequiredFields(req.body, [
      "username",
      "email",
      "password",
    ]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }

    const userExists = await User.findOne({ $or: [{ username }, { email }] });
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the same username or email!",
      });
    }

    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    const hashedPassword = await bcrypt.hash(password, salt);
    const newCreatedUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      role: role || "user",
    });
    await newCreatedUser.save();
    if (newCreatedUser) {
      const payload = {
        userId: newCreatedUser._id,
        role: newCreatedUser.role,
        username: newCreatedUser.username,
      };
      const token = generateToken(payload, res);

      res.status(201).json({
        success: true,
        message: "User created successfully.",
        data: newCreatedUser,
        token: token,
      });
    } else {
      res.status(422).json({
        success: false,
        message: "Unable to register the user, please try again",
      });
    }
  } catch (error) {
    handleBadRequest(error, res);
  }
};

const loginUser = async (req, res) => {
  try {
    const missingFields = validateRequiredFields(req.body, [
      "usernameOrEmail",
      "password",
    ]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }
    const { usernameOrEmail, password } = req.body;
    // Check if you have user with this username or email
    const userExists = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (userExists) {
      // Check if password is correct
      const match = await bcrypt.compare(password, userExists.password);
      if (match) {
        const payload = {
          userId: userExists._id,
          role: userExists.role,
          username: userExists.username,
        };
        const token = generateToken(payload, res);
        return res.status(200).json({
          success: true,
          message: "User managed to login successfully.",
          token: token,
        });
      }
    }
    res.status(401).json({
      success: false,
      message: "User unauthenticated",
    });
  } catch (error) {
    handleBadRequest(error, res);
  }
};

const logoutUser = async (req, res) => {
  // Basically delete the token cookie
  try {
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(Date.now() + getTimeInMilliseconds("1s")), // Set the cookie to expire in 1 second
    });

    res.status(200).json({
      success: true,
      message: "User logged Out Successfully.",
    });
  } catch (error) {
    handleBadRequest(error, res);
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const missingFields = validateRequiredFields(req.body, [
      "currentPassword",
      "newPassword",
    ]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(", ")}`,
      });
    }
    // Check if the user exists in the database
    const user = await User.findById(req.user.userId); // From the auth middleware
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // Check if the current password is correct
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }
    // Check if the new password is the same as the current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }
    // Hash the new password and update it in the database
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedNewPassword;
    await user.save();
    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    handleBadRequest(error, res);
  }
};

export { registerUser, loginUser, logoutUser, changePassword };

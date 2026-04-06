import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import handleBadRequest from "../utils/handleBadRequest.js";
import { generateToken } from "../utils/generateToken.js";
import { getTimeInMilliseconds } from "../utils/getTimeInMilliseconds.js";
// REMOVE the role later (Set it to user by default and only admin manually from database)
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const userExists = User.find({ $or: [{ username }, { email }] });
    if (userExists > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists with the same username or email!",
      });
    }
    const salt = await bcrypt.genSalt(process.env.SALT_ROUNDS);
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
    const { usernameOrEmail, password } = req.body;
    // Check if you have user with this username or email
    const userExists = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (userExists) {
      // Check if password is correct
      const match = await bcrypt.compare(password, userExists.password);
      if (match) {
        payload = {
          userId: userExists._id,
          role: userExists.role,
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
      maxAge: getTimeInMilliseconds(options.expiresIn),
    });

    res.status(200).json({
      success: true,
      message: "User logged Out Successfully.",
    });
  } catch (error) {
    handleBadRequest(error, res);
  }
};

export { registerUser, loginUser, logoutUser };

import jwt from "jsonwebtoken";
import { getTimeInMilliseconds } from "./getTimeInMilliseconds.js";

export const generateToken = (payload, res) => {
  const secretKey = process.env.JWT_SECRET;
  const options = {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  };

  const token = jwt.sign(payload, secretKey, options);

  // Set the jwt cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: getTimeInMilliseconds(options.expiresIn),
  });

  return token;
};

import { getToken } from "../utils/getToken.js";
import jwt from "jsonwebtoken";
// Check if the user is authenticated before allowing access to protected routes
const authMiddleware = (req, res, next) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, No token provided.",
    });
  }
  try {
    const secretKey = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded; // Attach the decoded token payload to the request object
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized, Invalid token.",
    });
  }

  next();
};

export default authMiddleware;

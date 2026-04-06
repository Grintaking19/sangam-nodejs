// Check if the user is admin or not
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden, You don't have permission to access this resource.",
    });
  }
  next();
};

export default adminMiddleware;

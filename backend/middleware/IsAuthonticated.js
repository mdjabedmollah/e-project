import jwt from "jsonwebtoken";
import { User } from "../models/userModels.js";


export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Step 1: Check token existence
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    // Step 2: Extract token
    const token = authHeader.split(" ")[1];

    // Step 3: Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "The registration token has expired",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Invalid or malformed token",
      });
    }

    // Step 4: Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Step 5: Attach user info to request
    req.id = user._id;
    req.user=user

    // Step 6: Continue to next middleware
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const isAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      res.status(401).json({ message: "Unauthorized, Admins only" });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



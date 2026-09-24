import mongoose from "mongoose";
import User from "../models/user.model.js";
import { verifyToken } from "../utils/jwt.js";

function sendUnauthorized(res, message = "Authentication required") {
  return res.status(401).json({
    success: false,
    message,
  });
}

function getToken(req) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }

  return null;
}

export async function protect(req, res, next) {
  try {
    const token = getToken(req);

    if (!token) {
      return sendUnauthorized(res);
    }

    let decoded;

    try {
      decoded = verifyToken(token);
    } catch {
      return sendUnauthorized(res, "Invalid or expired token");
    }

    const userId = decoded.id || decoded._id;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return sendUnauthorized(res, "Invalid or expired token");
    }

    const user = await User.findById(userId);

    if (!user) {
      return sendUnauthorized(res, "Invalid or expired token");
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(500).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

export function requireAuth(req, res, next) {
  // alias for protect to match existing route imports
  return protect(req, res, next);
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res);
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this resource",
      });
    }

    next();
  };
}

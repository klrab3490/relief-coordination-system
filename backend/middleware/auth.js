const jwt = require("jsonwebtoken");

// --------------------------
// AUTHENTICATION MIDDLEWARE
// --------------------------
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({
        success: false,
        message: "Invalid or missing token.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server error: Missing JWT_SECRET environment variable.",
      });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        const msg =
          err.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid or malformed token.";

        return res.status(401).json({ success: false, message: msg });
      }

      // Attach user info
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role?.toLowerCase(),
      };

      req.userId = decoded.id; // shortcut

      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication server error.",
    });
  }
};

// --------------------------
// ROLE AUTHORIZATION MIDDLEWARE
// --------------------------
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires role(s): ${roles.join(", ")}.`,
      });
    }

    next();
  };
};

module.exports = { verifyToken, authorize };

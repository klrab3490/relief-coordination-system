const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const RefreshToken = require("../models/refreshToken");

// Validation functions
const isValidRole = (role) => ["user", "volunteer", "admin"].includes(role);
const isValidEmail = (email) =>
  typeof email === "string" && /\S+@\S+\.\S+/.test(email);
const isValidUsername = (username) =>
  typeof username === "string" && username.length >= 3 && username.length <= 30;
const isValidPassword = (password) =>
  typeof password === "string" &&
  password.length >= 6 &&
  /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password);

// ---------------------------
// REGISTER USER
// ---------------------------
router.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!isValidUsername(username))
      return res
        .status(400)
        .json({ message: "Username must be 3–30 characters long." });

    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format." });

    if (!isValidRole(role))
      return res.status(400).json({ message: "Invalid user role." });

    if (!isValidPassword(password))
      return res.status(400).json({
        message:
          "Password must contain 1 uppercase, 1 lowercase, 1 number and be 6+ characters.",
      });

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser)
      return res
        .status(409)
        .json({ message: "Username or email already in use." });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---------------------------
// LOGIN USER
// ---------------------------
router.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format." });

    if (!password)
      return res.status(400).json({ message: "Password is required." });

    // Find user
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    // Check environment variables
    if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
      return res
        .status(500)
        .json({ message: "Authentication server error (missing env keys)." });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    // Save refresh token
    await RefreshToken.create({
      token: refreshToken,
      userId: user._id,
      createdAt: Date.now(),
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

// ---------------------------
// REFRESH TOKEN
// ---------------------------
router.post("/api/auth/token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token is required." });

  try {
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken)
      return res.status(403).json({ message: "Invalid refresh token." });

    const userData = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newAccessToken = jwt.sign(
      { id: userData.id, email: userData.email, role: userData.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired refresh token." });
  }
});

// ---------------------------
// LOGOUT USER
// ---------------------------
router.post("/api/auth/logout", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(400).json({ message: "Refresh token is required." });

  try {
    const deletedToken = await RefreshToken.deleteOne({ token: refreshToken });

    if (deletedToken.deletedCount === 0) {
      return res.status(404).json({ message: "Token not found." });
    }

    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;

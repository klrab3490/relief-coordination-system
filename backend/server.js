const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

// Load environment variables
dotenv.config();
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  process.exit(1);
}
if (!process.env.PORT) {
  console.error("❌ PORT is not defined in environment variables");
  process.exit(1);
}
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("❌ JWT_SECRET or JWT_REFRESH_SECRET is not defined in environment variables");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(morgan("combined"));
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB Connected"))
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

// Routes


// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

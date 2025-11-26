const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const listRoutes = require("./utils/listRoutes");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const usersRoute = require("./routes/users");
const reportsRoute = require("./routes/reports");
const volunteerRoute = require("./routes/volunteer");

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
  console.error(
    "❌ JWT_SECRET or JWT_REFRESH_SECRET is not defined in environment variables"
  );
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Configure Helmet with a Content Security Policy that allows local scripts
// and the Tailwind CDN used in `public/index.html`.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
      },
    },
  })
);
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
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

// Routes
app.use("/api", authRoute);
app.use("/api", adminRoute);
app.use("/api", usersRoute);
app.use("/api", reportsRoute);
app.use("/api", volunteerRoute);

app.get("/list", (req, res) => {
  const routes = listRoutes(app);

  const groups = {
    Basic: [],
    "Auth Route": [],
    "Admin Route": [],
    "User Route": [],
    "Report Route": [],
    "Volunteer Route": [],
  };

  routes.forEach((r) => {
    if (!groups[r.type]) groups["Basic"].push(r);
    else groups[r.type].push(r);
  });

  Object.keys(groups).forEach((key) =>
    groups[key].sort((a, b) => a.path.localeCompare(b.path))
  );

  res.json({
    total: routes.length,
    groups,
  });
});

// NOW static files are served AFTER
app.use(express.static(path.join(__dirname, "public")));

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

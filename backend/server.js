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
const uploadRoute = require("./routes/upload");

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

// CORS Configuration - Define allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

// Create HTTP server
const http = require("http");
const server = http.createServer(app);

// Initialize Socket.IO
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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
        connectSrc: [
          "'self'",
          "http://localhost:3000",
          "http://localhost:5173",
          "ws://localhost:3000"
        ],
        fontSrc: ["'self'", 'https://cdn.jsdelivr.net'],
        objectSrc: ["'none'"],
      },
    },
  })
);
app.use(morgan("combined"));

// Apply CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies
  })
);

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
app.use("/api", uploadRoute);

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

// Serve uploaded images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve public static files AFTER API routes
app.use(express.static(path.join(__dirname, "public")));

// -----------------------------
// SOCKET.IO CHAT IMPLEMENTATION
// -----------------------------
io.on("connection", (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  // Join a specific chat room (e.g., report-specific chat)
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    socket.to(roomId).emit("user_joined", {
      userId: socket.id,
      message: "A user has joined the chat",
    });
  });

  // Leave a chat room
  socket.on("leave_room", (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit("user_left", {
      userId: socket.id,
      message: "A user has left the chat",
    });
  });

  // Send message to a room
  socket.on("send_message", (data) => {
    const { roomId, message, username, timestamp } = data;
    io.to(roomId).emit("receive_message", {
      userId: socket.id,
      username,
      message,
      timestamp,
    });
  });

  // Typing indicator
  socket.on("typing", (data) => {
    const { roomId, username } = data;
    socket.to(roomId).emit("user_typing", { username });
  });

  socket.on("stop_typing", (data) => {
    const { roomId } = data;
    socket.to(roomId).emit("user_stop_typing");
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// Start Server (use server instead of app)
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

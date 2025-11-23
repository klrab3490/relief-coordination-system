const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");

const listRoutes = require("./utils/listRoutes");
const authRoute = require("./routes/auth");
const usersRoute = require("./routes/users");
const reportsRoute = require("./routes/reports");

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
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Connection Error:", err));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).send("Server is healthy");
});

// Routes
app.use(authRoute);
app.use(usersRoute);
app.use(reportsRoute);

// Homepage to list all routes
app.get("/", (req, res) => {
  const routes = listRoutes(app);

  // Group by type
  const groups = {
    "Basic": [],
    "Auth Route": [],
    "User Route": [],
    "Report Route": [],
  };

  routes.forEach((r) => {
    if (!groups[r.type]) groups["Basic"].push(r);
    else groups[r.type].push(r);
  });

  // Sort each group by path
  Object.keys(groups).forEach((key) => {
    groups[key].sort((a, b) => a.path.localeCompare(b.path));
  });

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>API Routes</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          background: #f3f4f6;
        }
        h1 {
          margin-bottom: 20px;
        }
        h2 {
          margin-top: 40px;
          margin-bottom: 10px;
          color: #111827;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 20px;
        }
        th, td {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
        th {
          background: #111827;
          color: white;
          text-align: left;
        }
        tr:hover {
          background: #f9fafb;
        }
        .count {
          margin-bottom: 15px;
          font-weight: bold;
        }
      </style>

      <script>
        setInterval(() => {
          window.location.reload();
        }, 5000);
      </script>
    </head>
    <body>
      <h1>Registered API Routes</h1>
      <div class="count">Total Routes: ${routes.length}</div>

      ${Object.keys(groups)
        .map((type) => {
          const group = groups[type];
          if (group.length === 0) return "";

          return `
            <h2>${type} (${group.length})</h2>
            <table>
              <tr>
                <th>Method(s)</th>
                <th>Path</th>
              </tr>
              ${group
                .map(
                  (r) => `
                  <tr>
                    <td>${r.methods}</td>
                    <td>${r.path}</td>
                  </tr>
                `
                )
                .join("")}
            </table>
          `;
        })
        .join("")}

    </body>
    </html>
  `);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

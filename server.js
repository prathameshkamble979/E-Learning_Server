require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Configure allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-learning-client-k6ow.onrender.com",
  "https://e-learning-server-ss29.onrender.com"
];


app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://e-learning-client-k6ow.onrender.com",
    "https://e-learning-server-ss29.onrender.com"
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // Dynamic origin
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
  }

  // Immediately respond to OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

// 2. Add this before routes:
app.options("/*", (req, res) => res.sendStatus(200)); // Explicit OPTIONS handler

// ✅ Routes
app.use("/auth", require("./routes/auth-routes/index"));
app.use("/media", require("./routes/instructor-routes/media-routes"));
app.use("/instructor/course", require("./routes/instructor-routes/course-routes"));
app.use("/student/course", require("./routes/student-routes/course-routes"));
app.use("/student/order", require("./routes/student-routes/order-routes"));
app.use("/student/courses-bought", require("./routes/student-routes/student-courses-routes"));
app.use("/student/course-progress", require("./routes/student-routes/course-progress-routes"));


// ✅ Health check endpoint
app.get("/api/healthcheck", (req, res) => {
  res.json({
    status: "healthy",
    cors: {
      yourOrigin: req.headers.origin,
      allowed: allowedOrigins.includes(req.headers.origin),
      allAllowedOrigins: allowedOrigins
    }
  });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err.stack);
  res.status(500).json({ 
    success: false, 
    message: err.message || "Server error",
    corsIssue: err.message.includes("CORS") ? "Check your CORS configuration" : undefined
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on PORT ${PORT}`));
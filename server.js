require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware
app.use(cookieParser());
app.use(express.json());

// ✅ Allowed frontend + backend origins (Render sometimes needs both)
const allowedOrigins = [
  "http://localhost:5173",
  "https://e-learning-client-k6ow.onrender.com",
  "https://e-learning-frontend-nu.vercel.app",
  "https://e-learning-server-ss29.onrender.com" // Add backend URL for Render proxy
];

// ✅ Enhanced CORS config
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`🚨 CORS blocked for origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true, // Required for cookies
    optionsSuccessStatus: 200 // Legacy browsers
  })
);

// ✅ Explicit OPTIONS handler for preflight
app.options("*", cors());

// ✅ Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection failed:", err));

// ✅ Routes
app.use("/auth", require("./routes/auth-routes/index"));
app.use("/media", require("./routes/instructor-routes/media-routes"));
app.use("/instructor/course", require("./routes/instructor-routes/course-routes"));
app.use("/student/course", require("./routes/student-routes/course-routes"));
app.use("/student/order", require("./routes/student-routes/order-routes"));
app.use("/student/courses-bought", require("./routes/student-routes/student-courses-routes"));
app.use("/student/course-progress", require("./routes/student-routes/course-progress-routes"));
// ... other routes ...

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || "Server error" });
});

// ✅ Start server
app.listen(PORT, () => console.log(`🚀 Server running on PORT ${PORT}`));
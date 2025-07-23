require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// 🔐 Optional: Only load HTTPS modules and certs in development
const fs = require("fs");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Middleware to parse cookies
app.use(cookieParser());

// ✅ CORS setup to allow cookies
const cors = require("cors");

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://e-learning-client-k6ow.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Explicitly handle preflight requests
//


// Explicit CORS headers (only if needed, after cors())
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://e-learning-frontend-nu.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});


// ✅ Parses incoming JSON payloads
app.use(express.json());

// ✅ DB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB is connected"))
  .catch((e) => console.log("❌ MongoDB connection error:", e));

// ✅ Route Mounts
app.use("/auth", require("./routes/auth-routes/index"));
app.use("/media", require("./routes/instructor-routes/media-routes"));
app.use("/instructor/course", require("./routes/instructor-routes/course-routes"));
app.use("/student/course", require("./routes/student-routes/course-routes"));
app.use("/student/order", require("./routes/student-routes/order-routes"));
app.use("/student/courses-bought", require("./routes/student-routes/student-courses-routes"));
app.use("/student/course-progress", require("./routes/student-routes/course-progress-routes"));

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

// ✅ Start Server (HTTPS in development, HTTP in production)
if (process.env.NODE_ENV === "development") {
  const privateKey = fs.readFileSync("key.pem", "utf8");
  const certificate = fs.readFileSync("cert.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate };

  https.createServer(credentials, app).listen(PORT, () => {
    console.log(`🔐 HTTPS Dev Server running at https://localhost:${PORT}`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Production server running on PORT ${PORT}`);
  });
}

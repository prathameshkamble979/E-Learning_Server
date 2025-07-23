require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const https = require("https");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ✅ Cookie parser
app.use(cookieParser());

// ✅ Allowed client URLs
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://e-learning-client-k6ow.onrender.com", // Render client
  "https://e-learning-frontend-nu.vercel.app" // Vercel client
];

// ✅ CORS Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ JSON parser
app.use(express.json());

// ✅ Additional CORS headers (in case needed)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ DB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB is connected"))
  .catch((e) => console.error("❌ MongoDB connection error:", e));

// ✅ Routes
app.use("/auth", require("./routes/auth-routes/index"));
app.use("/media", require("./routes/instructor-routes/media-routes"));
app.use("/instructor/course", require("./routes/instructor-routes/course-routes"));
app.use("/student/course", require("./routes/student-routes/course-routes"));
app.use("/student/order", require("./routes/student-routes/order-routes"));
app.use("/student/courses-bought", require("./routes/student-routes/student-courses-routes"));
app.use("/student/course-progress", require("./routes/student-routes/course-progress-routes"));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

// ✅ Start server
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

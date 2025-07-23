import axios from "axios";

// ✅ Dynamically switch baseURL based on environment
const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : "https://e-learning-client-k6ow.onrender.com", 
  withCredentials: true, // ✅ Allow sending cookies (important for authentication)
});

// ✅ Optional: Attach token if you're using Authorization headers
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem("accessToken");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default axiosInstance;

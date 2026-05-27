import dotenv from "dotenv";
dotenv.config(); // MUST be first

import express, { Application } from "express";
import cors from "cors";
import { connectDB } from "./config/db";

// Routes
import authRoutes from "./routes/UserRoute";
import adminRoutes from "./routes/AdminRoute";
import businessRoutes from "./routes/BusinessRoute";
import measurementRoutes from "./routes/MeasurementRoute";
import closetRoutes from "./routes/ClosetRoute";
import productRoutes from "./routes/ProductRoute";
import styleRoutes from "./routes/Style";
import tailorRoutes from "./routes/TailorRequestRoute";
import orderRoutes from "./routes/OrderRoute";
import platformAccountRoutes from "./routes/PlatformAccaountRoute";

const app: Application = express();

// ======================
// CORS CONFIG
// ======================
const allowedOrigins = [
  "http://localhost:5173",
  "https://afrio.vercel.app",
  "https://www.luxeehub.com",
  "https://luxeehub.com",
  "https://afrio-qfwqx5hyx-mahmuds-projects-5b377daa.vercel.app",
];

app.use(cors({
  origin: "*"
}));
// ======================
// MIDDLEWARE
// ======================
app.use(express.json());

// ======================
// ROUTES
// ======================
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/closet", closetRoutes);
app.use("/api/products", productRoutes);
app.use("/api/styles", styleRoutes);
app.use("/api/tailor-requests", tailorRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/accounts", platformAccountRoutes);

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ======================
// START SERVER AFTER DB
// ======================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
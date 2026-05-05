import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

// Routes
import authRoutes from "./routes/UserRoute";
import adminRoutes from "./routes/AdminRoute"
import businessRoutes from "./routes/BusinessRoute";
import measurementRoutes from "./routes/MeasurementRoute";
import closetRoutes from "./routes/ClosetRoute";
import ProductRoute from "./routes/ProductRoute";
import StyleRoute from "./routes/Style";
import tailorRoute  from "./routes/TailorRequestRoute";
import orderRoute from "./routes/OrderRoute";
import platformAccountRoutes from "./routes/PlatformAccaountRoute";


dotenv.config();

const app: Application = express();


// Middleware
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/closet", closetRoutes);
app.use("/api/products", ProductRoute);
app.use("/api/styles", StyleRoute);
app.use("/api/tailor-requests", tailorRoute)
app.use("/api/orders", orderRoute)
app.use("/api/accounts", platformAccountRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Start server AFTER DB
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
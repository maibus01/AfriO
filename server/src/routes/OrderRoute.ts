import express from "express";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getSellerOrders,

  // ADMIN
  markPaymentReceived,
  markDelivered,
  searchOrderByRef,

  // SELLER
  sellerStartProcessing,
  sellerReadyForPickup,
  sellerMarkUnavailable,
} from "../controllers/orderController";

import { protect, restrictTo } from "../middleware/authMiddleware";

const router = express.Router();

//
// ==============================
// CUSTOMER ROUTES
// ==============================
//

// 🛒 Create order
router.post("/", protect, createOrder);

// 👤 Customer orders
router.get("/me", protect, getMyOrders);

//
// ==============================
// SELLER ROUTES
// ==============================
//

// 🏪 Seller sees orders for their businesses
router.get("/seller", protect, getSellerOrders);

// 📦 Seller starts processing (after payment received)
router.patch("/:id/start-processing", protect, sellerStartProcessing);

// 🚚 Seller marks ready for pickup (Afri logistic)
router.patch("/:id/ready-pickuo", protect, sellerReadyForPickup);

// ❌ Seller marks item unavailable (admin only concern)
router.patch("/:id/unavailable", protect, sellerMarkUnavailable);

//
// ==============================
// ADMIN ROUTES
// ==============================
//

// 👑 Get all orders
router.get("/", protect, restrictTo("admin"), getAllOrders);

// 💳 Admin confirms payment
router.patch(
  "/:id/payment-received",
  protect,
  restrictTo("admin"),
  markPaymentReceived
);

// ✅ Admin completes order (delivered)
router.patch(
  "/:id/delivered",
  protect,
  restrictTo("admin"),
  markDelivered
);

router.get("/search", searchOrderByRef);


export default router;
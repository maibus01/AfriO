import express from "express";
import {
  createTailorRequest,
  addMeasurementToRequest, // ✅ updated name
  getMyTailorRequests,
  getTailorRequests,
  getTailorRequestById,
  setPriceByAdmin,
  confirmPayment,
  startTailorWork,
  completeTailorRequest,
  getAllTailorRequestsAdmin,
} from "../controllers/TailorRequestController";

import { protect, restrictTo } from "../middleware/authMiddleware";

const router = express.Router();

//
// ==============================
// CUSTOMER ROUTES
// ==============================
//

// ✅ create request (NO measurement required)
router.post(
  "/",
  protect,
  restrictTo("user"),
  createTailorRequest
);

// ✅ get my requests
router.get(
  "/my",
  protect,
  restrictTo("user"),
  getMyTailorRequests
);

// ✅ add ONE measurement AFTER request
router.patch(
  "/:id/add-measurement", // ✅ singular
  protect,
  restrictTo("user"),
  addMeasurementToRequest
);

// ✅ confirm payment (if customer does it)
router.patch(
  "/:id/confirm-payment",
  protect,
  restrictTo("user"),
  confirmPayment
);


//
// ==============================
// TAILOR ROUTES
// ==============================
//

// ✅ tailor sees requests
router.get(
  "/tailor",
  protect,
  getTailorRequests
);

// ✅ start work (requires measurement)
router.patch(
  "/:id/start",
  protect,
  startTailorWork
);

// ✅ complete work
router.patch(
  "/:id/complete",
  protect,
  completeTailorRequest
);


//
// ==============================
// ADMIN ROUTES
// ==============================
//

// ✅ admin: get all requests
router.get(
  "/admin",
  protect,
  restrictTo("admin"),
  getAllTailorRequestsAdmin
);

// ✅ admin: set price
router.patch(
  "/:id/set-price",
  protect,
  restrictTo("admin"),
  setPriceByAdmin
);

// ✅ admin: confirm payment (manual)
router.patch(
  "/:id/payment-received",
  protect,
  restrictTo("admin"),
  confirmPayment
);


//
// ==============================
// SHARED ROUTES
// ==============================
//

// ✅ get single request (customer OR tailor OR admin)
router.get(
  "/:id",
  protect,
  getTailorRequestById
);

export default router;
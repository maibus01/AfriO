import express from "express";
import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByBusiness,
  getAllProductsAdmin,
  addVariant,
  getVariantById,
  // updateVariant,
  // deleteVariant,
  getTopProducts,
} from "../controllers/productController";

import { protect, restrictTo } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = express.Router();

// ==========================================
// 1. STATIC AUTHENTICATED / SPECIAL ROUTES (MUST GO FIRST)
// ==========================================

// 🔐 Authenticated user profile products (Moved to the top!)
router.get("/me", protect, getMyProducts);

// ⭐ Top products
router.get("/top", getTopProducts);

// 🔐 Admin route
router.get(
  "/admin/all",
  protect,
  restrictTo("admin"),
  getAllProductsAdmin
);


// ==========================================
// 2. DYNAMIC / PARAMETERIZED ROUTES 
// ==========================================

// 📦 Products by business
router.get("/business/:businessId", getProductsByBusiness);

// 📄 Single product (Kept below /me so "me" is never parsed as an ID)
router.get("/:id", getProductById);

router.get(
  "/products/:productId/variants/:variantId",
  getVariantById
);

// 📦 All products
router.get("/", getAllProducts);


// ==========================================
// 3. VENDOR ACTION ROUTES
// ==========================================

router.post("/", protect, restrictTo("user"), upload.array("images", 10), createProduct);

router.patch("/:id", protect, restrictTo("user"), upload.array("images", 10), updateProduct);

router.delete("/:id", protect, restrictTo("user"), deleteProduct);


// ==========================================
// 4. VENDOR VARIANT SUB-ROUTES
// ==========================================
router.post(
  "/",
  protect,
  restrictTo("user"),
  upload.array("images", 10), // 👈 IMPORTANT
  addVariant
);

// router.patch(
//   "/:id/variants/:variantId",
//   protect,
//   restrictTo("user"),
//   updateVariant
// );

// router.delete(
//   "/:id/variants/:variantId",
//   protect,
//   restrictTo("user"),
//   deleteVariant
// );

export default router;
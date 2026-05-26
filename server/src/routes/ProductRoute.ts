// // import express from "express";
// // import {
// //   createProduct,
// //   getMyProducts,
// //   updateProduct,
// //   deleteProduct,
// //   getAllProducts,
// //   getProductById,
// //   getProductsByBusiness,
// // } from "../controllers/productController";

// // import { protect } from "../middleware/authMiddleware";

// // const router = express.Router();

// // // 🌍 PUBLIC routes
// // router.get("/", getAllProducts);
// // router.get("/me", protect, getMyProducts); // optional but better
// // router.get("/business/:businessId", getProductsByBusiness);
// // router.get("/:id", getProductById); // MUST be last public route

// // // 🔐 PROTECTED routes
// // router.use(protect);

// // router.post("/", createProduct);
// // router.patch("/:id", updateProduct);
// // router.delete("/:id", deleteProduct);

// // export default router;


// import express from "express";
// import {
//   createProduct,
//   getMyProducts,
//   updateProduct,
//   deleteProduct,
//   getAllProducts,
//   getProductById,
//   getProductsByBusiness,
//   getAllProductsAdmin,
 
//   addVariant,
//   updateVariant,
//   deleteVariant,
 
//   getTopProducts,
// } from "../controllers/productController";

// import { protect, restrictTo } from "../middleware/authMiddleware";

// const router = express.Router();

// //
// // 🌍 PUBLIC ROUTES (ORDER MATTERS)
// //

// // 🔍 search FIRST (before /:id)
// // router.get("/search", searchProducts);

// // ⭐ top products
// router.get("/top", getTopProducts);

// // 📦 products by business
// router.get("/business/:businessId", getProductsByBusiness);

// // 📄 single product
// router.get("/:id", getProductById);

// // 📦 all products
// router.get("/", getAllProducts);

// //
// // 🔐 AUTHENTICATED USER
// //
// router.get("/me", protect, getMyProducts);

// //
// // 🔐 VENDOR ROUTES
// //
// router.post("/", protect, restrictTo("vendor"), createProduct);

// router.patch("/:id", protect, restrictTo("vendor"), updateProduct);

// router.delete("/:id", protect, restrictTo("vendor"), deleteProduct);

// // ✅ activate / deactivate
// // router.patch(
// //   "/:id/toggle",
// //   protect,
// //   restrictTo("vendor"),
// //   toggleProductStatus
// // );

// //
// // 🧩 VARIANTS (VENDOR)
// //
// router.post(
//   "/:id/variants",
//   protect,
//   restrictTo("vendor"),
//   addVariant
// );

// router.patch(
//   "/:id/variants/:variantId",
//   protect,
//   restrictTo("vendor"),
//   updateVariant
// );

// router.delete(
//   "/:id/variants/:variantId",
//   protect,
//   restrictTo("vendor"),
//   deleteVariant
// );

// //
// // 🔐 ADMIN
// //
// router.get(
//   "/admin/all",
//   protect,
//   restrictTo("admin"),
//   getAllProductsAdmin
// );

// export default router;


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
  updateVariant,
  deleteVariant,
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
  "/:id/variants",
  protect,
  restrictTo("user"),
  upload.array("image", 10), // 👈 IMPORTANT
  addVariant
);

router.patch(
  "/:id/variants/:variantId",
  protect,
  restrictTo("user"),
  updateVariant
);

router.delete(
  "/:id/variants/:variantId",
  protect,
  restrictTo("user"),
  deleteVariant
);

export default router;
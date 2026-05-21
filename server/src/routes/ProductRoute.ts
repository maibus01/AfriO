import express from "express";
import {
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  getProductsByBusiness,
} from "../controllers/productController";

import { protect } from "../middleware/authMiddleware";
import { uploadProductImages } from "../middleware/upload";

const router = express.Router();

// 🌍 PUBLIC routes
router.get("/", getAllProducts);
router.get("/me", protect, getMyProducts); // optional but better
router.get("/business/:businessId", getProductsByBusiness);
router.get("/:id", getProductById); // MUST be last public route

// 🔐 PROTECTED routes
router.use(protect);

router.post("/", uploadProductImages, createProduct);
router.patch("/:id", uploadProductImages, updateProduct);
router.delete("/:id", deleteProduct);

export default router;

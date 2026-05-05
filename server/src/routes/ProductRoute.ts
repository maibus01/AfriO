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

const router = express.Router();

// 🌍 PUBLIC routes
router.get("/", getAllProducts);
router.get("/me", protect, getMyProducts); // optional but better
router.get("/business/:businessId", getProductsByBusiness);
router.get("/:id", getProductById); // MUST be last public route

// 🔐 PROTECTED routes
router.use(protect);

router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
import express from "express";
import {
  createStyle,
  getMyStyles,
  updateStyle,
  deleteStyle,
  getAllStyles,
  getStyleById,
  getStylesByBusiness,
} from "../controllers/styleController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// 🌍 PUBLIC routes (same as products)
router.get("/", getAllStyles);
router.get("/me", protect, getMyStyles); // same pattern as products
router.get("/business/:businessId", getStylesByBusiness);
router.get("/:id", getStyleById); // MUST be last public route


// 🔐 PROTECTED routes (same as products)
router.use(protect);

router.post("/", createStyle);
router.patch("/:id", updateStyle);
router.delete("/:id", deleteStyle);

export default router;
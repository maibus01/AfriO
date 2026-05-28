import express from "express";
import { addVariant } from "../controllers/productController";
import { protect, restrictTo } from "../middleware/authMiddleware";
import upload from "../middleware/upload";

const router = express.Router();

router.post(
  "/",
  protect,
  restrictTo("user"),
  upload.array("images", 10),
  addVariant
);

export default router;
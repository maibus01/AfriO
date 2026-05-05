import express from "express";
import {
  createClosetItem,
  getMyCloset,
  updateClosetItem,
  deleteClosetItem,
} from "../controllers/closetController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// 🔐 All routes are protected
router.use(protect);

// 🧥 Create item (manual OR purchased)
router.post("/", createClosetItem);

// 📦 Get all my closet items
router.get("/", getMyCloset);

// ✏️ Update item
router.patch("/:id", updateClosetItem);

// ❌ Delete item
router.delete("/:id", deleteClosetItem);

export default router;
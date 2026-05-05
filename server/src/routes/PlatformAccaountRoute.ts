import express from "express";
import {
  createPlatformAccount,
  getPlatformAccounts,
  updatePlatformAccount,
  deletePlatformAccount,
} from "../controllers/platformAccountController";

import { protect, restrictTo } from "../middleware/authMiddleware";

const router = express.Router();

// 🌍 PUBLIC (or protected users) → get accounts for checkout
router.get("/", protect, getPlatformAccounts);

// 🔐 ADMIN ONLY
router.post("/", protect, restrictTo("admin"), createPlatformAccount);
router.put("/:id", protect, restrictTo("admin"), updatePlatformAccount);
router.delete("/:id", protect, restrictTo("admin"), deletePlatformAccount);

export default router;
import express from "express";
import {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
  deactivateMe,
} from "../controllers/userController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// public
router.post("/register", register);
router.post("/login", login);

// protected
router.use(protect);

router.get("/me", getMe);
router.patch("/update-me", updateMe);
router.patch("/update-password", updatePassword);
router.delete("/deactivate", deactivateMe);

export default router;
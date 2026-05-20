import express from "express";
import {
  createBusiness,
  getMyBusinesses,
  getBusinessById,
  updateBusiness,
  deleteBusiness,
  getBusinessPublic,
  getAllBusinessesPublic,
} from "../controllers/businessController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/:id/public", getBusinessPublic);

router.get("/public", getAllBusinessesPublic);

router.use(protect);

router.post("/", createBusiness);
router.get("/", getMyBusinesses);
router.get("/:id", getBusinessById);
router.patch("/:id", updateBusiness);
router.delete("/:id", deleteBusiness);

export default router;
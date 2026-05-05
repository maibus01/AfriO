import express from "express";
import {
  createMeasurement,
  getMyMeasurements,
  getMeasurementById,
  updateMeasurement,
  deleteMeasurement,
  getUserMeasurements,
} from "../controllers/measurementController";

import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.post("/", createMeasurement);
router.get("/", getMyMeasurements);
router.get("/:id", getMeasurementById);
router.patch("/:id", updateMeasurement);
router.delete("/:id", deleteMeasurement);
router.get("/user/:userId", getUserMeasurements); // ✅ IMPORTANT ORDER

export default router;
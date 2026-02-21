import express from "express";
import {
  getOnlineDoctors,
  setAvailability,
} from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { validateAvailabilityPayload } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.get("/online", protect, getOnlineDoctors);
router.patch(
  "/availability",
  protect,
  authorize("doctor"),
  validateAvailabilityPayload,
  setAvailability,
);

export default router;

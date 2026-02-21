import express from "express";
import {
  createBooking,
  endSession,
  getBookingById,
  getBookingMessages,
  getMyDoctorBookings,
  getMyUserBookings,
  sendBookingMessage,
  startSession,
} from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  validateBookingParam,
  validateCreateBookingPayload,
  validateMessagePayload,
} from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("user"),
  validateCreateBookingPayload,
  createBooking,
);
router.get("/user/me", protect, authorize("user"), getMyUserBookings);
router.get("/doctor/me", protect, authorize("doctor"), getMyDoctorBookings);
router.patch(
  "/:bookingId/start",
  protect,
  authorize("doctor"),
  validateBookingParam,
  startSession,
);
router.patch(
  "/:bookingId/end",
  protect,
  authorize("doctor"),
  validateBookingParam,
  endSession,
);
router.get("/:bookingId", protect, validateBookingParam, getBookingById);
router.post(
  "/:bookingId/messages",
  protect,
  validateBookingParam,
  validateMessagePayload,
  sendBookingMessage,
);
router.get(
  "/:bookingId/messages",
  protect,
  validateBookingParam,
  getBookingMessages,
);

export default router;

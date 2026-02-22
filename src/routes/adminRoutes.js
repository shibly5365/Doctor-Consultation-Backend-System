import express from "express";
import {
  approveDoctor,
  blockDoctor,
  blockUser,
  getDoctors,
  getTransactions,
  getUsers,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import {
  validateDoctorParam,
  validateUserParam,
} from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));
router.get("/doctors", getDoctors);
router.get("/users", getUsers);
router.patch("/doctors/:doctorId/approve", validateDoctorParam, approveDoctor);
router.patch("/doctors/:doctorId/block", validateDoctorParam, blockDoctor);
router.patch("/users/:userId/block", validateUserParam, blockUser);
router.get("/transactions", getTransactions);

export default router;

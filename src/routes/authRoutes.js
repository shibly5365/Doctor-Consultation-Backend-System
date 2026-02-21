import express from "express";
import {
  loginAdmin,
  loginDoctor,
  loginUser,
  logout,
  registerDoctor,
  registerUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateDoctorRegister,
  validateLogin,
  validateUserRegister,
} from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post("/users/register", validateUserRegister, registerUser);
router.post("/users/login", validateLogin, loginUser);
router.post("/doctors/register", validateDoctorRegister, registerDoctor);
router.post("/doctors/login", validateLogin, loginDoctor);
router.post("/admin/login", validateLogin, loginAdmin);
router.post("/logout", protect, logout);

export default router;

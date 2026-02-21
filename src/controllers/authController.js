import { authService } from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const data = await authService.registerUser(req.body);
  res.status(201).json({ success: true, message: "User registered", data });
});

export const loginUser = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  res.status(200).json({ success: true, message: "User logged in", data });
});

export const registerDoctor = asyncHandler(async (req, res) => {
  const data = await authService.registerDoctor(req.body);
  res.status(201).json({ success: true, message: "Doctor registered", data });
});

export const loginDoctor = asyncHandler(async (req, res) => {
  const data = await authService.loginDoctor(req.body);
  res.status(200).json({ success: true, message: "Doctor logged in", data });
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const data = await authService.loginAdmin(req.body);
  res.status(200).json({ success: true, message: "Admin logged in", data });
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully. Remove token on client side.",
  });
});

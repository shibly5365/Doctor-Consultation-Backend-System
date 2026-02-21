import { adminService } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.approveDoctor(
    req.params.doctorId,
    req.body.isApproved ?? true,
  );
  res
    .status(200)
    .json({ success: true, message: "Doctor approval updated", data: doctor });
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await adminService.blockUser(
    req.params.userId,
    req.body.isBlocked ?? true,
  );
  res
    .status(200)
    .json({ success: true, message: "User block status updated", data: user });
});

export const blockDoctor = asyncHandler(async (req, res) => {
  const doctor = await adminService.blockDoctor(
    req.params.doctorId,
    req.body.isBlocked ?? true,
  );
  res
    .status(200)
    .json({
      success: true,
      message: "Doctor block status updated",
      data: doctor,
    });
});

export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await adminService.getTransactions();
  res
    .status(200)
    .json({
      success: true,
      message: "Transactions fetched",
      data: transactions,
    });
});

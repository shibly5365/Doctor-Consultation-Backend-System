import { doctorService } from "../services/doctorService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const setAvailability = asyncHandler(async (req, res) => {
  const { isOnline } = req.body;
  const doctor = await doctorService.setAvailability(req.user._id, isOnline);
  res
    .status(200)
    .json({ success: true, message: "Availability updated", data: doctor });
});

export const getOnlineDoctors = asyncHandler(async (req, res) => {
  const doctors = await doctorService.getOnlineDoctors();
  res
    .status(200)
    .json({ success: true, message: "Online doctors fetched", data: doctors });
});

export const getDoctorDirectory = asyncHandler(async (req, res) => {
  const doctors = await doctorService.getDoctorDirectory();
  res
    .status(200)
    .json({ success: true, message: "Doctors fetched", data: doctors });
});

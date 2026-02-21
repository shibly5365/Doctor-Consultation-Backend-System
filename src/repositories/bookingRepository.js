import Booking from "../models/Booking.js";
import Doctor from "../models/Doctor.js";

export const bookingRepository = {
  create(payload) {
    return Booking.create(payload);
  },

  findById(id) {
    return Booking.findById(id)
      .populate("user", "name email role")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email role" },
      });
  },

  updateById(id, payload) {
    return Booking.findByIdAndUpdate(id, payload, { new: true })
      .populate("user", "name email role")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email role" },
      });
  },

  findByUserId(userId) {
    return Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("user", "name email role")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email role" },
      });
  },

  async findByDoctorUserId(doctorUserId) {
    const doctor = await Doctor.findOne({ user: doctorUserId }).select("_id");
    if (!doctor) {
      return [];
    }

    return Booking.find({ doctor: doctor._id })
      .sort({ createdAt: -1 })
      .populate("user", "name email role")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email role" },
      });
  },
};

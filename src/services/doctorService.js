import { doctorRepository } from "../repositories/doctorRepository.js";
import { AppError } from "../utils/AppError.js";
import { getIO } from "../socket/socket.js";

export const doctorService = {
  async setAvailability(userId, isOnline) {
    const doctor = await doctorRepository.findByUserId(userId);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404);
    }

    if (!doctor.isApproved) {
      throw new AppError("Doctor profile is not approved", 403);
    }

    if (doctor.isBlocked) {
      throw new AppError("Doctor profile is blocked", 403);
    }

    const updatedDoctor = await doctorRepository.updateById(doctor._id, {
      isOnline: Boolean(isOnline),
    });

    getIO().emit("doctor:availability:updated", {
      doctorId: updatedDoctor._id,
      isOnline: updatedDoctor.isOnline,
      updatedAt: updatedDoctor.updatedAt,
    });

    return updatedDoctor;
  },

  async getOnlineDoctors() {
    return doctorRepository.findApprovedOnline();
  },
};

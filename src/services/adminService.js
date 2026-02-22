import { doctorRepository } from "../repositories/doctorRepository.js";
import { transactionRepository } from "../repositories/transactionRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { AppError } from "../utils/AppError.js";

export const adminService = {
  async approveDoctor(doctorId, isApproved = true) {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    return doctorRepository.updateById(doctorId, {
      isApproved: Boolean(isApproved),
    });
  },

  async blockUser(userId, isBlocked = true) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return userRepository.updateById(userId, { isBlocked: Boolean(isBlocked) });
  },

  async blockDoctor(doctorId, isBlocked = true) {
    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    const updatedDoctor = await doctorRepository.updateById(doctorId, {
      isBlocked: Boolean(isBlocked),
      isOnline: false,
    });

    await userRepository.updateById(updatedDoctor.user._id, {
      isBlocked: Boolean(isBlocked),
    });

    return updatedDoctor;
  },

  async getTransactions() {
    return transactionRepository.findAll();
  },

  async getDoctors() {
    return doctorRepository.findAll();
  },

  async getUsers() {
    return userRepository.findByRole("user");
  },
};

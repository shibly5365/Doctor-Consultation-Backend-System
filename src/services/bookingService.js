import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Doctor from "../models/Doctor.js";
import Transaction from "../models/Transaction.js";
import { bookingRepository } from "../repositories/bookingRepository.js";
import { doctorRepository } from "../repositories/doctorRepository.js";
import { AppError } from "../utils/AppError.js";
import { getIO } from "../socket/socket.js";

const resolveParticipant = (booking, userId, role) => {
  if (role === "user" && String(booking.user._id) === String(userId)) {
    return true;
  }

  if (
    role === "doctor" &&
    String(booking.doctor.user?._id || booking.doctor.user) === String(userId)
  ) {
    return true;
  }

  return false;
};

const isTransactionUnsupportedError = (error) => {
  const msg = error?.message || "";
  return (
    msg.includes("Transaction numbers are only allowed on a replica set member") ||
    msg.includes("Transaction numbers are only allowed on a mongos")
  );
};

export const bookingService = {
  async createBooking(userId, doctorId) {
    if (!doctorId) {
      throw new AppError("doctorId is required", 400);
    }

    const doctor = await doctorRepository.findById(doctorId);
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    if (!doctor.isApproved || doctor.isBlocked) {
      throw new AppError("Doctor not available for booking", 400);
    }

    const booking = await bookingRepository.create({
      user: userId,
      doctor: doctorId,
      commissionRate: Number(process.env.COMMISSION_RATE || 0.2),
    });

    return bookingRepository.findById(booking._id);
  },

  async startSession(bookingId, doctorUserId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status !== "booked") {
      throw new AppError("Session can only be started from booked state", 400);
    }

    const isDoctorOwner =
      String(booking.doctor.user?._id || booking.doctor.user) ===
      String(doctorUserId);
    if (!isDoctorOwner) {
      throw new AppError("You cannot start this session", 403);
    }

    const updated = await bookingRepository.updateById(bookingId, {
      status: "in_session",
      startTime: new Date(),
    });

    getIO().to(`booking:${bookingId}`).emit("session:started", {
      bookingId: updated._id,
      startTime: updated.startTime,
      status: updated.status,
    });

    return updated;
  },

  async endSession(bookingId, doctorUserId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (booking.status !== "in_session" || !booking.startTime) {
      throw new AppError("Session is not active", 400);
    }

    const isDoctorOwner =
      String(booking.doctor.user?._id || booking.doctor.user) ===
      String(doctorUserId);
    if (!isDoctorOwner) {
      throw new AppError("You cannot end this session", 403);
    }

    const endTime = new Date();
    const durationMinutes = Math.max(
      1,
      Math.ceil((endTime.getTime() - booking.startTime.getTime()) / 60000),
    );

    const totalAmount = booking.doctor.consultationFee * durationMinutes;
    const commissionRate = booking.commissionRate;
    const platformCommission = Number(
      (totalAmount * commissionRate).toFixed(2),
    );
    const doctorEarning = Number((totalAmount - platformCommission).toFixed(2));

    const updatePayload = {
      status: "completed",
      endTime,
      durationMinutes,
      totalAmount,
      platformCommission,
      doctorEarning,
    };

    let updatedBooking;
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        updatedBooking = await Booking.findByIdAndUpdate(bookingId, updatePayload, {
          new: true,
          session,
        });

        await Doctor.findByIdAndUpdate(
          booking.doctor._id,
          { $inc: { totalEarnings: doctorEarning } },
          { session },
        );

        await Transaction.create(
          [
            {
              booking: booking._id,
              user: booking.user._id,
              doctor: booking.doctor._id,
              totalAmount,
              doctorEarning,
              platformCommission,
            },
          ],
          { session },
        );
      });
    } catch (error) {
      if (!isTransactionUnsupportedError(error)) {
        throw error;
      }

      console.warn(
        "[booking:endSession] MongoDB transaction unsupported in current deployment. Falling back to non-transactional write flow.",
      );

      updatedBooking = await Booking.findByIdAndUpdate(bookingId, updatePayload, {
        new: true,
      });

      await Doctor.findByIdAndUpdate(booking.doctor._id, {
        $inc: { totalEarnings: doctorEarning },
      });

      await Transaction.create({
        booking: booking._id,
        user: booking.user._id,
        doctor: booking.doctor._id,
        totalAmount,
        doctorEarning,
        platformCommission,
      });
    } finally {
      await session.endSession();
    }

    const hydrated = await bookingRepository.findById(updatedBooking._id);

    getIO().to(`booking:${bookingId}`).emit("session:ended", {
      bookingId: hydrated._id,
      endTime: hydrated.endTime,
      durationMinutes: hydrated.durationMinutes,
      totalAmount: hydrated.totalAmount,
      doctorEarning: hydrated.doctorEarning,
      status: hydrated.status,
    });

    return hydrated;
  },

  async getBookingDetails(bookingId, userId, role) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    const isParticipant = resolveParticipant(booking, userId, role);
    if (!isParticipant && role !== "admin") {
      throw new AppError("Forbidden resource", 403);
    }

    return booking;
  },

  async getUserBookings(userId) {
    return bookingRepository.findByUserId(userId);
  },

  async getDoctorBookings(doctorUserId) {
    return bookingRepository.findByDoctorUserId(doctorUserId);
  },
};

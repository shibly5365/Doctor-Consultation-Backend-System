import { bookingRepository } from "../repositories/bookingRepository.js";
import { messageRepository } from "../repositories/messageRepository.js";
import { AppError } from "../utils/AppError.js";
import { getIO } from "../socket/socket.js";

const isBookingParticipant = (booking, userId, role) => {
  if (role === "admin") return true;
  if (role === "user" && String(booking.user._id) === String(userId))
    return true;
  if (
    role === "doctor" &&
    String(booking.doctor.user?._id || booking.doctor.user) === String(userId)
  ) {
    return true;
  }
  return false;
};

export const chatService = {
  async authorizeChatAccess(
    bookingId,
    userId,
    role,
    requireActiveSession = false,
  ) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (!isBookingParticipant(booking, userId, role)) {
      throw new AppError("Forbidden resource", 403);
    }

    if (requireActiveSession && booking.status !== "in_session") {
      throw new AppError("Chat is available only during active session", 400);
    }

    return booking;
  },

  async saveMessage({ bookingId, senderId, senderRole, content }) {
    if (!content || !content.trim()) {
      throw new AppError("Message content is required", 400);
    }

    return messageRepository.create({
      booking: bookingId,
      sender: senderId,
      senderRole,
      content: content.trim(),
    });
  },

  async sendMessage({
    bookingId,
    senderId,
    senderRole,
    content,
    requireActiveSession = true,
  }) {
    await this.authorizeChatAccess(
      bookingId,
      senderId,
      senderRole,
      requireActiveSession,
    );

    const message = await this.saveMessage({
      bookingId,
      senderId,
      senderRole,
      content,
    });

    getIO().to(`booking:${bookingId}`).emit("chat:received", message);
    return message;
  },

  async listMessages(bookingId, userId, role) {
    await this.authorizeChatAccess(bookingId, userId, role);
    return messageRepository.findByBooking(bookingId);
  },
};

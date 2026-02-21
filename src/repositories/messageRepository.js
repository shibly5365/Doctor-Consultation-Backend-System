import Message from "../models/Message.js";

export const messageRepository = {
  create(payload) {
    return Message.create(payload);
  },

  findByBooking(bookingId, limit = 100) {
    return Message.find({ booking: bookingId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate("sender", "name email role");
  },
};

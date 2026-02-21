import Transaction from "../models/Transaction.js";

export const transactionRepository = {
  create(payload) {
    return Transaction.create(payload);
  },

  findAll() {
    return Transaction.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate({
        path: "doctor",
        populate: { path: "user", select: "name email" },
      })
      .populate("booking");
  },
};

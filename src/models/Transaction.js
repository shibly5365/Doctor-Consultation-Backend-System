import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    doctorEarning: {
      type: Number,
      required: true,
    },
    platformCommission: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);

transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;

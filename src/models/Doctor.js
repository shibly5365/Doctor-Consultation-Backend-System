import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specialization: String,
    consultationFee: {
      type: Number,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

doctorSchema.index({ user: 1 }, { unique: true });
doctorSchema.index({ isOnline: 1, isApproved: 1, isBlocked: 1 });

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;

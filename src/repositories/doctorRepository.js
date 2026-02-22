import Doctor from "../models/Doctor.js";

export const doctorRepository = {
  create(payload) {
    return Doctor.create(payload);
  },

  findById(id) {
    return Doctor.findById(id).populate("user", "-password");
  },

  findByUserId(userId) {
    return Doctor.findOne({ user: userId }).populate("user", "-password");
  },

  findApprovedOnline() {
    return Doctor.find({
      isOnline: true,
      isApproved: true,
      isBlocked: false,
    }).populate("user", "name email");
  },

  findApprovedDirectory() {
    return Doctor.find({
      isApproved: true,
      isBlocked: false,
    })
      .sort({ isOnline: -1, createdAt: -1 })
      .populate("user", "name email");
  },

  findAll() {
    return Doctor.find({})
      .sort({ createdAt: -1 })
      .populate("user", "name email role isBlocked");
  },

  updateById(id, payload) {
    return Doctor.findByIdAndUpdate(id, payload, { new: true }).populate(
      "user",
      "-password",
    );
  },
};

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

  updateById(id, payload) {
    return Doctor.findByIdAndUpdate(id, payload, { new: true }).populate(
      "user",
      "-password",
    );
  },
};

import User from "../models/User.js";

export const userRepository = {
  findByEmail(email) {
    return User.findOne({ email });
  },

  findById(id) {
    return User.findById(id);
  },

  create(payload) {
    return User.create(payload);
  },

  updateById(id, payload) {
    return User.findByIdAndUpdate(id, payload, { new: true });
  },

  findByRole(role) {
    return User.find({ role })
      .sort({ createdAt: -1 })
      .select("-password");
  },
};

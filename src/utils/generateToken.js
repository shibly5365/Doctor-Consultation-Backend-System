import jwt from "jsonwebtoken";
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.EXPIRESIN || "7d",
  });
};

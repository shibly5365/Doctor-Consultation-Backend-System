import { AppError } from "../utils/AppError.js";

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Unauthorized request", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("Forbidden resource", 403);
    }

    next();
  };
};

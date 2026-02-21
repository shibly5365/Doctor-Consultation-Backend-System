import mongoose from "mongoose";
import { AppError } from "../utils/AppError.js";

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const optionalBoolean = (value) =>
  value === undefined || typeof value === "boolean";

const validate = (checker) => (req, res, next) => {
  const errorMessage = checker(req);
  if (errorMessage) {
    throw new AppError(errorMessage, 400);
  }
  next();
};

export const validateUserRegister = validate((req) => {
  const { name, email, password } = req.body;
  if (!isNonEmptyString(name)) return "name is required";
  if (!isNonEmptyString(email)) return "email is required";
  if (!isNonEmptyString(password) || password.length < 6) {
    return "password must be at least 6 characters";
  }
  return null;
});

export const validateLogin = validate((req) => {
  const { email, password } = req.body;
  if (!isNonEmptyString(email)) return "email is required";
  if (!isNonEmptyString(password)) return "password is required";
  return null;
});

export const validateDoctorRegister = validate((req) => {
  const { name, email, password, specialization, consultationFee } = req.body;
  if (!isNonEmptyString(name)) return "name is required";
  if (!isNonEmptyString(email)) return "email is required";
  if (!isNonEmptyString(password) || password.length < 6) {
    return "password must be at least 6 characters";
  }
  if (!isNonEmptyString(specialization)) return "specialization is required";
  if (typeof consultationFee !== "number" || consultationFee <= 0) {
    return "consultationFee must be a positive number";
  }
  return null;
});

export const validateAvailabilityPayload = validate((req) => {
  if (typeof req.body.isOnline !== "boolean") {
    return "isOnline must be boolean";
  }
  return null;
});

export const validateCreateBookingPayload = validate((req) => {
  if (!isValidObjectId(req.body.doctorId)) {
    return "doctorId must be a valid id";
  }
  return null;
});

export const validateBookingParam = validate((req) => {
  if (!isValidObjectId(req.params.bookingId)) {
    return "bookingId must be a valid id";
  }
  return null;
});

export const validateMessagePayload = validate((req) => {
  if (!isNonEmptyString(req.body.content)) {
    return "content is required";
  }

  if (req.body.content.trim().length > 1000) {
    return "content must be at most 1000 characters";
  }

  return null;
});

export const validateDoctorParam = validate((req) => {
  if (!isValidObjectId(req.params.doctorId)) {
    return "doctorId must be a valid id";
  }
  if (
    !optionalBoolean(req.body.isApproved) ||
    !optionalBoolean(req.body.isBlocked)
  ) {
    return "isApproved/isBlocked must be boolean when provided";
  }
  return null;
});

export const validateUserParam = validate((req) => {
  if (!isValidObjectId(req.params.userId)) {
    return "userId must be a valid id";
  }
  if (!optionalBoolean(req.body.isBlocked)) {
    return "isBlocked must be boolean when provided";
  }
  return null;
});

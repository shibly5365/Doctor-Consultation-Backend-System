import bcrypt from "bcryptjs";
import { doctorRepository } from "../repositories/doctorRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { generateToken } from "../utils/generateToken.js";
import { AppError } from "../utils/AppError.js";

const sanitizeUser = (userDoc) => ({
  id: userDoc._id,
  name: userDoc.name,
  email: userDoc.email,
  role: userDoc.role,
  isBlocked: userDoc.isBlocked,
});

export const authService = {
  async registerUser(payload) {
    const { name, email, password } = payload;
    if (!name || !email || !password) {
      throw new AppError("name, email and password are required", 400);
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
    });

    const token = generateToken({ id: user._id, role: user.role });
    return { token, user: sanitizeUser(user) };
  },

  async loginUser(payload) {
    const { email, password } = payload;
    if (!email || !password) {
      throw new AppError("email and password are required", 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user || user.role !== "user") {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.isBlocked) {
      throw new AppError("Account blocked by admin", 403);
    }

    const token = generateToken({ id: user._id, role: user.role });
    return { token, user: sanitizeUser(user) };
  },

  async registerDoctor(payload) {
    const { name, email, password, specialization, consultationFee } = payload;
    if (!name || !email || !password || !specialization || !consultationFee) {
      throw new AppError(
        "name, email, password, specialization and consultationFee are required",
        400,
      );
    }

    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError("Email already in use", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
    });

    const doctor = await doctorRepository.create({
      user: user._id,
      specialization,
      consultationFee,
      isApproved: false,
    });

    const token = generateToken({ id: user._id, role: user.role });
    return { token, user: sanitizeUser(user), doctor };
  },

  async loginDoctor(payload) {
    const { email, password } = payload;
    if (!email || !password) {
      throw new AppError("email and password are required", 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user || user.role !== "doctor") {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.isBlocked) {
      throw new AppError("Account blocked by admin", 403);
    }

    const doctor = await doctorRepository.findByUserId(user._id);
    if (!doctor) {
      throw new AppError("Doctor profile not found", 404);
    }

    if (doctor.isBlocked) {
      throw new AppError("Doctor is blocked by admin", 403);
    }

    if (!doctor.isApproved) {
      throw new AppError("Doctor profile is pending admin approval", 403);
    }

    const token = generateToken({ id: user._id, role: user.role });
    return { token, user: sanitizeUser(user), doctor };
  },

  async loginAdmin(payload) {
    const { email, password } = payload;
    if (!email || !password) {
      throw new AppError("email and password are required", 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user || user.role !== "admin") {
      throw new AppError("Invalid credentials", 401);
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.isBlocked) {
      throw new AppError("Account blocked by admin", 403);
    }

    const token = generateToken({ id: user._id, role: user.role });
    return { token, user: sanitizeUser(user) };
  },
};

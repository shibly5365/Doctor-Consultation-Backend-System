import { bookingService } from "../services/bookingService.js";
import { chatService } from "../services/chatService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking(
    req.user._id,
    req.body.doctorId,
  );
  res
    .status(201)
    .json({ success: true, message: "Booking created", data: booking });
});

export const startSession = asyncHandler(async (req, res) => {
  const booking = await bookingService.startSession(
    req.params.bookingId,
    req.user._id,
  );
  res
    .status(200)
    .json({ success: true, message: "Session started", data: booking });
});

export const endSession = asyncHandler(async (req, res) => {
  const booking = await bookingService.endSession(
    req.params.bookingId,
    req.user._id,
  );
  res
    .status(200)
    .json({ success: true, message: "Session ended", data: booking });
});

export const getBookingById = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingDetails(
    req.params.bookingId,
    req.user._id,
    req.user.role,
  );
  res
    .status(200)
    .json({ success: true, message: "Booking fetched", data: booking });
});

export const getBookingMessages = asyncHandler(async (req, res) => {
  const messages = await chatService.listMessages(
    req.params.bookingId,
    req.user._id,
    req.user.role,
  );
  res
    .status(200)
    .json({ success: true, message: "Messages fetched", data: messages });
});

export const sendBookingMessage = asyncHandler(async (req, res) => {
  const message = await chatService.sendMessage({
    bookingId: req.params.bookingId,
    senderId: req.user._id,
    senderRole: req.user.role,
    content: req.body.content,
    requireActiveSession: true,
  });

  res.status(201).json({
    success: true,
    message: "Message sent",
    data: message,
  });
});

export const getMyUserBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getUserBookings(req.user._id);
  res.status(200).json({
    success: true,
    message: "User bookings fetched",
    data: bookings,
  });
});

export const getMyDoctorBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.getDoctorBookings(req.user._id);
  res.status(200).json({
    success: true,
    message: "Doctor bookings fetched",
    data: bookings,
  });
});

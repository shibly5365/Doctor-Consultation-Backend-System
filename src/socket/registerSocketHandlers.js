import jwt from "jsonwebtoken";
import { chatService } from "../services/chatService.js";
import { AppError } from "../utils/AppError.js";

const safeEmitError = (socket, message) => {
  socket.emit("chat:error", { message });
};

export const registerSocketHandlers = (io) => {
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Unauthorized socket connection"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id, role: decoded.role };
      return next();
    } catch (error) {
      return next(new Error("Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("chat:join", async ({ bookingId }) => {
      try {
        if (!bookingId) throw new AppError("bookingId is required", 400);

        await chatService.authorizeChatAccess(
          bookingId,
          socket.user.id,
          socket.user.role,
          true,
        );

        socket.join(`booking:${bookingId}`);
        socket.emit("chat:joined", { bookingId });
      } catch (error) {
        safeEmitError(socket, error.message);
      }
    });

    socket.on("chat:send", async ({ bookingId, content }) => {
      try {
        const message = await chatService.sendMessage({
          bookingId,
          senderId: socket.user.id,
          senderRole: socket.user.role,
          content,
          requireActiveSession: true,
        });

        socket.emit("chat:sent", { id: message._id });
      } catch (error) {
        safeEmitError(socket, error.message);
      }
    });

    socket.on("chat:typing", async ({ bookingId, isTyping }) => {
      try {
        await chatService.authorizeChatAccess(
          bookingId,
          socket.user.id,
          socket.user.role,
          true,
        );

        socket.to(`booking:${bookingId}`).emit("chat:typing", {
          bookingId,
          userId: socket.user.id,
          role: socket.user.role,
          isTyping: Boolean(isTyping),
        });
      } catch (error) {
        safeEmitError(socket, error.message);
      }
    });

    socket.on("disconnect", () => {
      socket.removeAllListeners();
    });
  });
};

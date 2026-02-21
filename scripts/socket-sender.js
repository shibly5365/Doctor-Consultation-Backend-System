import { io } from "socket.io-client";

const token = process.env.TOKEN;
const bookingId = process.env.BOOKING_ID;
const message = process.env.MSG || "Hello from socket sender";
const baseUrl = process.env.SOCKET_URL || "http://localhost:5000";

if (!token) {
  console.error("Missing TOKEN env var");
  process.exit(1);
}

if (!bookingId) {
  console.error("Missing BOOKING_ID env var");
  process.exit(1);
}

const socket = io(baseUrl, {
  auth: { token },
});

socket.on("connect", () => {
  console.log("connected:", socket.id);
  socket.emit("chat:join", { bookingId });

  setTimeout(() => {
    socket.emit("chat:typing", { bookingId, isTyping: true });
    socket.emit("chat:send", { bookingId, content: message });

    setTimeout(() => {
      socket.emit("chat:typing", { bookingId, isTyping: false });
    }, 700);
  }, 700);
});

socket.on("chat:joined", (data) => console.log("chat:joined", data));
socket.on("chat:received", (data) =>
  console.log("chat:received", data.content || data),
);
socket.on("chat:error", (data) => console.log("chat:error", data));
socket.on("disconnect", (reason) => console.log("disconnected:", reason));

setTimeout(() => {
  socket.disconnect();
  process.exit(0);
}, 8000);

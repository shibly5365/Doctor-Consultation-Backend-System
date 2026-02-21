import { io } from "socket.io-client";

const token = process.env.TOKEN;
const bookingId = process.env.BOOKING_ID;
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
});

socket.on("chat:joined", (data) => console.log("chat:joined", data));
socket.on("chat:received", (data) =>
  console.log("chat:received", data.content || data),
);
socket.on("chat:typing", (data) => console.log("chat:typing", data));
socket.on("chat:error", (data) => console.log("chat:error", data));
socket.on("doctor:availability:updated", (data) =>
  console.log("doctor:availability:updated", data),
);
socket.on("session:started", (data) => console.log("session:started", data));
socket.on("session:ended", (data) => console.log("session:ended", data));
socket.on("disconnect", (reason) => console.log("disconnected:", reason));

process.on("SIGINT", () => {
  socket.disconnect();
  process.exit(0);
});

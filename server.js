import http from "http";
import dotenv from "dotenv";
import app from "./src/app.js";
import { connectDb } from "./src/config/db.js";
import { registerSocketHandlers } from "./src/socket/registerSocketHandlers.js";
import { initSocket } from "./src/socket/socket.js";

dotenv.config();

connectDb();
const server = http.createServer(app);
const io = initSocket(server);
registerSocketHandlers(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

import { Server as Engine } from "@socket.io/bun-engine";
import "dotenv/config";
import { Server } from "socket.io";

const engine = new Engine({
  path: "/socket.io/",
});

const io = new Server({
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.bind(engine);

io.on("connection", (socket) => {
  console.log("a new user connected", socket.id);
});

export default {
  port: 8080,
  ...engine.handler(),
};

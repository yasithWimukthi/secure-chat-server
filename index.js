const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const server = http.createServer(app);

//request allow any domain
app.use(cors({ origin: "*" }));

//Body parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

app.use(bodyParser.json());

// Route files

// Mount routers

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// map to store all messages of users by room
const messages = new Map();

io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
    //get messages from map and send to client
    if (messages.has(data)) {
      socket.emit("get_messages", messages.get(data));
    } else {
      socket.emit("get_messages", []);
    }
  });

  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    console.log("data", data);

    //save messages to map
    if (messages.has(data.room)) {
      messages.get(data.room).push(data);
    } else {
      messages.set(data.room, [data]);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, console.log(`Server running on port ${PORT}`));

module.exports = app;

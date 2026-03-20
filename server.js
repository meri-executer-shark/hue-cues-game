const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

let rooms = {}; // roomId: { players: [] }
let roomState = {}; // roomId: { color, chatCount }

// send updated room list to everyone
function updateRoomList() {
  io.emit("roomList", Object.keys(rooms));
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  updateRoomList();

  // CREATE ROOM
  socket.on("createRoom", (roomId) => {
    if (!roomId) return;
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }
    updateRoomList();
  });

  // JOIN ROOM
  socket.on("joinRoom", (roomId) => {
    if (!roomId) return;

    socket.join(roomId);

    if (!rooms[roomId]) rooms[roomId] = { players: [] };

    if (!rooms[roomId].players.includes(socket.id)) {
      rooms[roomId].players.push(socket.id);
    }

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
    updateRoomList();
  });

  // CHOOSER SET COLOR
  socket.on("setColor", ({ roomId, color }) => {
    if (!roomState[roomId]) roomState[roomId] = {};
    roomState[roomId].color = color;
    roomState[roomId].chatCount = 0;

    io.to(roomId).emit("newRound", { color });
  });

  // CHAT
  socket.on("chat", ({ roomId, msg }) => {
    if (!roomState[roomId]) return;
    if (!roomState[roomId].chatCount) roomState[roomId].chatCount = 0;
    if (roomState[roomId].chatCount >= 2) return;

    roomState[roomId].chatCount++;
    io.to(roomId).emit("chatMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("User left:", socket.id);
  });
});

server.listen(port, () => {
  console.log("Server running on port " + port);
});
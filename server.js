const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

let rooms = {};
let state = {};

// get current host
function getHost(roomId) {
  return rooms[roomId].players[state[roomId].hostIndex];
}

io.on("connection", (socket) => {

  // JOIN ROOM
  socket.on("joinRoom", (roomId) => {
    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
      state[roomId] = {
        hostIndex: 0,
        color: null,
        guessed: false
      };
    }

    if (!rooms[roomId].players.includes(socket.id)) {
      rooms[roomId].players.push(socket.id);
    }

    socket.join(roomId);

    io.to(roomId).emit("roomUpdate", {
      players: rooms[roomId].players,
      host: getHost(roomId)
    });
  });

  // HOST PICKS COLOR ONLY
  socket.on("setColor", ({ roomId, color }) => {
    if (!state[roomId]) return;

    let host = getHost(roomId);
    if (socket.id !== host) return; // block cheating

    state[roomId].color = color;
    state[roomId].guessed = false;

    io.to(roomId).emit("newRound", { color });
  });

  // CHAT (FREE BUT SIMPLE)
  socket.on("chat", ({ roomId, msg }) => {
    io.to(roomId).emit("chatMessage", msg);
  });

  // GUESS SYSTEM
  socket.on("guess", ({ roomId, color }) => {
    if (!state[roomId]) return;

    if (state[roomId].guessed) return;

    if (color === state[roomId].color) {
      state[roomId].guessed = true;

      // NEXT HOST
      state[roomId].hostIndex =
        (state[roomId].hostIndex + 1) %
        rooms[roomId].players.length;

      state[roomId].color = null;

      io.to(roomId).emit("roundWin", {
        winner: socket.id
      });

      io.to(roomId).emit("roomUpdate", {
        players: rooms[roomId].players,
        host: getHost(roomId)
      });

      io.to(roomId).emit("nextRound");
    }
  });

});

server.listen(port, () => {
  console.log("Server running on " + port);
});
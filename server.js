const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

app.use(express.static("public"));

let rooms = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    if (!rooms[roomId]) {
      rooms[roomId] = { players: [] };
    }

    rooms[roomId].players.push(socket.id);

    io.to(roomId).emit("roomUpdate", rooms[roomId]);
  });

  socket.on("setColor", ({ roomId, color }) => {
    io.to(roomId).emit("newRound", {
      color,
      chooser: socket.id
    });
  });

  socket.on("guess", ({ roomId, guess }) => {
    io.to(roomId).emit("guessResult", guess);
  });

  socket.on("disconnect", () => {
    console.log("User left:", socket.id);
  });
});

server.listen(port, () => {
  console.log("Server running on port " + port);
});
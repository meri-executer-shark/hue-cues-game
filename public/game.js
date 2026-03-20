const socket = io();

let roomId = prompt("Enter room code:");
socket.emit("joinRoom", roomId);

const board = document.getElementById("board");
const result = document.getElementById("result");

let myRole = null;
let currentColor = null;

// 🎮 CREATE COLOR BOARD
for (let i = 0; i < 36; i++) {
  let tile = document.createElement("div");
  tile.className = "tile";

  let hue = (i * 360) / 36;
  let color = `hsl(${hue}, 100%, 50%)`;

  tile.style.backgroundColor = color;

  tile.onclick = () => {
    // only chooser sets color
    if (myRole === "chooser") {
      currentColor = color;
      socket.emit("setColor", { roomId, color });
      result.innerText = "Color set! Waiting for guesser...";
    } else {
      socket.emit("guess", { roomId, guess: color });
    }
  };

  board.appendChild(tile);
}

// 👥 ROOM UPDATE (assign roles)
socket.on("roomUpdate", (room) => {
  if (room.players.length === 1) {
    myRole = "chooser";
    result.innerText = "You are CHOOSER 🎨";
  } else if (room.players.length === 2) {
    myRole = "guesser";
    result.innerText = "You are GUESSER 🎯";
  } else {
    result.innerText = "Room full";
  }
});

// 🎨 NEW ROUND
socket.on("newRound", (data) => {
  currentColor = data.color;

  if (myRole === "guesser") {
    result.innerText = "Guess the color!";
  }
});

// 🎯 GUESS RESULT
socket.on("guessResult", (guess) => {
  if (myRole === "chooser") {
    result.innerText = "Player guessed: " + guess;
  }
});
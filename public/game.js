console.log("CLIENT LOADED");

const socket = io();

let roomId = null;
let myId = null;
let hostId = null;
let isHost = false;

const board = document.getElementById("board");
const status = document.getElementById("status");
const chat = document.getElementById("chat");

socket.on("connect", () => {
  myId = socket.id;
});

// JOIN ROOM
function joinRoom() {
  roomId = document.getElementById("roomInput").value;

  if (!roomId) return;

  socket.emit("joinRoom", roomId);
}

// ROOM UPDATE (SET HOST)
socket.on("roomUpdate", (data) => {
  hostId = data.host;
  isHost = (myId === hostId);

  status.innerText = isHost
    ? "YOU ARE HOST 🎨"
    : "YOU ARE GUESSER 🎯";

  buildBoard();
});

// BUILD BOARD
function buildBoard() {
  board.innerHTML = "";

  for (let i = 0; i < 36; i++) {
    let tile = document.createElement("div");
    tile.className = "tile";

    let hue = (i * 360) / 36;
    let color = `hsl(${hue},100%,50%)`;

    tile.style.background = color;

    tile.onclick = () => {

      // HOST PICKS COLOR
      if (isHost) {
        socket.emit("setColor", { roomId, color });

        board.innerHTML = "";

        let big = document.createElement("div");
        big.style.width = "200px";
        big.style.height = "200px";
        big.style.background = color;
        big.style.margin = "20px auto";

        board.appendChild(big);

        return;
      }

      // GUESSER GUESS
      socket.emit("guess", { roomId, color });
    };

    board.appendChild(tile);
  }
}

// CHAT
function sendChat() {
  socket.emit("chat", {
    roomId,
    msg: document.getElementById("msg").value
  });

  document.getElementById("msg").value = "";
}

socket.on("chatMessage", (msg) => {
  let p = document.createElement("p");
  p.innerText = msg;
  chat.appendChild(p);
});

// NEXT ROUND RESET
socket.on("nextRound", () => {
  buildBoard();
});
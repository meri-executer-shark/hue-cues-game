const socket = io();

let roomId = null;
let role = null;

const roomList = document.getElementById("roomList");
const game = document.getElementById("game");
const board = document.getElementById("board");
const status = document.getElementById("status");
const chat = document.getElementById("chat");
const msg = document.getElementById("msg");

// UPDATE LOBBY ROOM LIST
socket.on("roomList", (rooms) => {
  roomList.innerHTML = "";
  rooms.forEach(r => {
    let div = document.createElement("div");
    div.className = "room";
    div.innerHTML = `<b>Room:</b> ${r} <button onclick="joinRoom('${r}')">Join</button>`;
    roomList.appendChild(div);
  });
});

// CREATE ROOM
function createRoom() {
  let code = document.getElementById("roomInput").value.trim();
  if (!code) { alert("Enter a room code!"); return; }
  socket.emit("createRoom", code);
  alert("Room created: " + code);
}

// JOIN ROOM
function joinRoom(code) {
  if (!code) return;
  roomId = code;

  socket.emit("joinRoom", code);

  game.style.display = "block";
  status.innerText = "Joined room: " + code;

  startBoard();
}

// ROLE ASSIGN
socket.on("roomUpdate", (room) => {
  if (room.players.length === 1) {
    role = "chooser";
    status.innerText = "You are CHOOSER 🎨 (2 chats max)";
  } else {
    role = "guesser";
    status.innerText = "You are GUESSER 🎯";
  }
});

// BUILD BOARD
function startBoard() {
  board.innerHTML = "";
  for (let i=0; i<36; i++) {
    let tile = document.createElement("div");
    tile.className = "tile";
    let hue = (i*360)/36;
    let color = `hsl(${hue},100%,50%)`;
    tile.style.background = color;

    tile.onclick = () => {
      if (role !== "chooser") return;

      socket.emit("setColor", { roomId, color });

      board.innerHTML = "";

      let big = document.createElement("div");
      big.style.width = "200px";
      big.style.height = "200px";
      big.style.background = color;
      big.style.margin = "20px auto";

      board.appendChild(big);
      status.innerText = "Describe your color (2 messages max)";
    };

    board.appendChild(tile);
  }
}

// CHAT SYSTEM
function sendChat() {
  if (!roomId || role !== "chooser") return;
  socket.emit("chat", { roomId, msg: msg.value });
  msg.value = "";
}

socket.on("chatMessage", (msg) => {
  let p = document.createElement("p");
  p.innerText = msg;
  chat.appendChild(p);
});
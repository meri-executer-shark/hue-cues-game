const board = document.getElementById("board");

// fake "hidden target"
const target = "H13";

function createBoard() {
  for (let i = 1; i <= 24; i++) {
    let tile = document.createElement("div");
    tile.className = "tile";
    tile.innerText = "H" + i;

    tile.onclick = () => {
      if ("H" + i === target) {
        document.getElementById("result").innerText = "Correct! 🎉";
      } else {
        document.getElementById("result").innerText = "Wrong ❌ try again";
      }
    };

    board.appendChild(tile);
  }
}

createBoard();
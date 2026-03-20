let targetColor = "";
let clueText = "";

function setColor() {
  targetColor = document.getElementById("colorPicker").value;
  clueText = document.getElementById("clue").value;

  document.getElementById("clueText").innerText = clueText;

  document.getElementById("secretColor").style.backgroundColor = targetColor;
}

function guess() {
  let guess = document.getElementById("guessColor").value;

  if (guess === targetColor) {
    document.getElementById("result").innerText = "Correct! 🎉";
  } else {
    document.getElementById("result").innerText = "Wrong ❌ try again";
  }
}
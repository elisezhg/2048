let BOARD_SIZE = 4;

let randomTileValues = [2, 4];
let state;

function initGame() {
  $(".board-layout-tiles .tile").html("").removeClass().addClass("tile");
  state = new Array(BOARD_SIZE ** 2).fill(0);
  generateRandomTile();
  generateRandomTile();

  // Tests
  // updateState(0, 2);
  // updateState(4, 4);
  // updateState(12, 4);
}

function checkGameStatus() {
  if (state.includes(2048)) {
    alert("You won 🤩");
    return 1;
  } else if (state.includes(0)) {
    return 0;
  } else {
    alert("You lost 😔");
    return -1;
  }
}

function generateRandomTile() {
  let noTile = getRandomTile();
  let value = getRandomValue();
  updateState(noTile, value);
}

function getRandomTile() {
  let tile;
  while (checkGameStatus() === 0 && (tile === undefined || state[tile] != 0)) {
    tile = Math.floor(Math.random() * state.length);
  }
  return tile;
}

function getRandomValue() {
  return randomTileValues[Math.floor(Math.random() * randomTileValues.length)];
}

function updateAllState() {
  // printState();
  for (let i = 0; i < state.length; i++) {
    let currentState = state[i];

    currentState === 0
      ? $(`.board-layout-tiles .tile:eq(${i})`)
          .html("")
          .removeClass()
          .addClass("tile")
      : $(`.board-layout-tiles .tile:eq(${i})`)
          .html(currentState)
          .removeClass()
          .addClass(`tile tile-${currentState}`);
  }
}

function updateState(noTile, value) {
  state[noTile] = value;
  $(`.board-layout-tiles .tile:eq(${noTile})`)
    .html(value)
    .addClass(`tile-${value}`)
    .css({ opacity: 0 })
    .animate({ opacity: 1 });
}

function compressUp() {
  for (let col = 0; col < BOARD_SIZE; col++) {
    let curr = col;

    for (let row = 1; row < BOARD_SIZE; row++) {
      let idx = col + row * BOARD_SIZE;

      if (curr >= idx || state[idx] === 0) continue;

      if (state[curr] === 0) {
        state[curr] = state[idx];
        state[idx] = 0;
        curr += BOARD_SIZE;
        // merge, compression
      } else if (state[curr] === state[idx]) {
        state[curr] *= 2;
        state[idx] = 0;
        curr += BOARD_SIZE;
        // non merge, compression
      } else {
        curr += BOARD_SIZE;
        if (curr != idx) {
          state[curr] = state[idx];
          state[idx] = 0;
        }
      }
    }
  }
  updateAllState();
  generateRandomTile();
}

function compressDown() {
  //TODO: implement
}

function compressLeft() {
  //TODO: implement
}

function compressRight() {
  //TODO: implement
}

function printState() {
  console.log("current state:");
  for (let col = 0; col < BOARD_SIZE; col++) {
    console.log(state.slice(col * BOARD_SIZE, (col + 1) * BOARD_SIZE));
  }
}

$(function () {
  // Initialize the game
  initGame();

  // Reset the game
  $("#reset").click(() => initGame());

  // Handle keypresses
  $(document).keyup((e) => {
    switch (e.which) {
      case 87:
      case 38:
        compressUp();
        break;
      case 83:
      case 40:
        compressDown();
        break;
      case 65:
      case 37:
        compressLeft();
        break;
      case 68:
      case 39:
        compressRight();
        break;
      default:
        break;
    }
  });
});

//TODO: add weight to the tiles
//todo: save cookies?
//todo: animation

let BOARD_SIZE = 5;

let randomTileValues = [2, 4];
let state;

function initGame() {
  // Fill board
  $(".board-layout").empty();
  for (let i = 0; i < BOARD_SIZE ** 2; i++) {
    $(".board-layout").append(
      $('<div class="tile"></div>').css({
        width: `calc((100% - ${BOARD_SIZE - 1} * 15px) / ${BOARD_SIZE})`,
        height: `calc((100% - ${BOARD_SIZE - 1} * 15px) / ${BOARD_SIZE})`,
        fontSize: `${80 - BOARD_SIZE * 6}px`,
      })
    );
  }

  state = new Array(BOARD_SIZE ** 2).fill(0);
  generateRandomTile();
  generateRandomTile();
}

function checkGameStatus() {
  if (state.includes(2048)) {
    alert("You won 🤩");
    return 1;
  } else if (state.includes(0)) {
    return 0;
  } else {
    //BUG: loss only if board is full and no more moves are possible
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
  do {
    tile = Math.floor(Math.random() * state.length);
  } while (checkGameStatus() === 0 && (tile === undefined || state[tile] != 0));
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
  checkGameStatus();
}

function updateState(noTile, value) {
  state[noTile] = value;
  $(`.board-layout-tiles .tile:eq(${noTile})`)
    .html(value)
    .addClass(`tile-${value} appear`);

  setTimeout(
    () => $(`.board-layout-tiles .tile:eq(${noTile})`).removeClass("appear"),
    300
  );
}

function rotateBoard() {
  state = state.map((_, idx) => {
    return state[
      (idx % BOARD_SIZE) * BOARD_SIZE + Math.floor(idx / BOARD_SIZE)
    ];
  });
}

function compress() {
  let generateNewTile = false;

  for (let col = 0; col < BOARD_SIZE; col++) {
    let curr = col;

    for (let row = 0; row < BOARD_SIZE; row++) {
      let idx = col + row * BOARD_SIZE;

      if (curr >= idx || state[idx] === 0) continue;

      if (state[curr] === 0) {
        state[curr] = state[idx];
        state[idx] = 0;
        generateNewTile = true;
      } else if (state[curr] === state[idx]) {
        state[curr] *= 2; // Merge tiles
        state[idx] = 0;
        curr += BOARD_SIZE;
        generateNewTile = true;
      } else {
        curr += BOARD_SIZE;
        if (curr != idx) {
          state[curr] = state[idx];
          state[idx] = 0;
          generateNewTile = true;
        }
      }
    }
  }
  return generateNewTile;
}

function compressUp() {
  let generateNewTile = compress();
  updateAllState();
  if (generateNewTile) generateRandomTile();
  // checkGameStatus();
}

function compressDown() {
  state = state.reverse();
  let generateNewTile = compress();
  state = state.reverse();
  updateAllState();
  if (generateNewTile) generateRandomTile();
  // checkGameStatus();
}

function compressLeft() {
  rotateBoard();
  let generateNewTile = compress();
  rotateBoard();
  updateAllState();
  if (generateNewTile) generateRandomTile();
}

function compressRight() {
  state = state.reverse();
  rotateBoard();
  let generateNewTile = compress();
  rotateBoard();
  state = state.reverse();
  updateAllState();
  if (generateNewTile) generateRandomTile();
  // checkGameStatus();
}

$(function () {
  BOARD_SIZE = +$("#board-size").val();

  // Listen to board size change
  $("#board-size").change(() => {
    BOARD_SIZE = +$("#board-size").val();
    initGame();
  });

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

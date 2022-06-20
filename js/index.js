let BOARD_SIZE = 5;

const randomTileValues = [2, 4];
let state;

// TODO
function checkGameStatus() {
  if (state.includes(2048)) {
    alert('You won 🤩');
    return 1;
  }
  if (state.includes(0)) {
    return 0;
  }
  // BUG: loss only if board is full and no more moves are possible
  alert('You lost 😔');
  return -1;
}

function addToScore(value) {
  const currentScore = +$('#score').text();
  $('#score').text(currentScore + value);
}

function updateState(noTile, value) {
  state[noTile] = value;
  $(`.board-layout-tiles .tile:eq(${noTile})`)
    .html(value)
    .addClass(`tile-${value} appear`);

  setTimeout(
    () => $(`.board-layout-tiles .tile:eq(${noTile})`).removeClass('appear'),
    200
  );
}

function getRandomTile() {
  let tile;
  do {
    tile = Math.floor(Math.random() * state.length);
  } while (
    checkGameStatus() === 0 &&
    (tile === undefined || state[tile] !== 0)
  );
  return tile;
}

function getRandomValue() {
  return randomTileValues[Math.floor(Math.random() * randomTileValues.length)];
}

function generateRandomTile() {
  setTimeout(() => {
    updateState(getRandomTile(), getRandomValue());
  }, 100);
}

function initGame() {
  // Fill board
  $('.board-layout').empty();
  for (let i = 0; i < BOARD_SIZE ** 2; i++) {
    $('.board-layout').append($('<div class="tile"></div>'));
  }

  // Initialize state
  state = new Array(BOARD_SIZE ** 2).fill(0);
  $('#score').text(0);

  generateRandomTile();
  generateRandomTile();
}

function rotateBoard() {
  state = state.map(
    (_, idx) =>
      state[(idx % BOARD_SIZE) * BOARD_SIZE + Math.floor(idx / BOARD_SIZE)]
  );
}

function animate(idx, curr, direction, pop) {
  let idx2;
  let curr2;
  let movingUnit;

  switch (direction) {
    case 'up':
      idx2 = idx;
      curr2 = curr;
      movingUnit = (curr - idx) / BOARD_SIZE;
      break;
    case 'down':
      idx2 = BOARD_SIZE ** 2 - idx - 1;
      curr2 = BOARD_SIZE ** 2 - curr - 1;
      movingUnit = (curr2 - idx2) / BOARD_SIZE;
      break;
    case 'left':
      idx2 = (idx % BOARD_SIZE) * BOARD_SIZE + Math.floor(idx / BOARD_SIZE);
      curr2 = (curr % BOARD_SIZE) * BOARD_SIZE + Math.floor(curr / BOARD_SIZE);
      movingUnit = curr2 - idx2;
      break;
    case 'right':
      idx2 = BOARD_SIZE ** 2 - idx - 1;
      curr2 = BOARD_SIZE ** 2 - curr - 1;
      idx2 = (idx2 % BOARD_SIZE) * BOARD_SIZE + Math.floor(idx2 / BOARD_SIZE);
      curr2 =
        (curr2 % BOARD_SIZE) * BOARD_SIZE + Math.floor(curr2 / BOARD_SIZE);
      movingUnit = curr2 - idx2;
      break;
    default:
      break;
  }

  // Amimate non empty tile
  if (
    $(`.board-layout-tiles .tile:eq(${idx2})`)
      .attr('class')
      .indexOf('tile-') !== 1
  ) {
    $(`.board-layout-tiles .tile:eq(${idx2})`)
      .addClass(
        `move-${
          direction === 'up' || direction === 'down' ? 'vertical' : 'horizontal'
        }`
      )
      .css('--moving-unit', movingUnit);
  }

  const tmpCurr = curr2;
  const tmpIdx = idx2;

  setTimeout(() => {
    // Erase old tile
    $(`.board-layout-tiles .tile:eq(${tmpIdx})`)
      .html('')
      .css('--moving-unit', '')
      .removeClass()
      .addClass('tile');

    // Place new tile
    if (state[tmpCurr]) {
      $(`.board-layout-tiles .tile:eq(${tmpCurr})`)
        .html(state[tmpCurr])
        .removeClass()
        .addClass(`tile tile-${state[tmpCurr]} ${pop ? 'pop' : ''}`);
    } else {
      $(`.board-layout-tiles .tile:eq(${tmpCurr})`)
        .html('')
        .removeClass()
        .addClass(`tile`);
    }

    // Set timer to remove pop class
    if (pop) {
      setTimeout(
        () => $(`.board-layout-tiles .tile:eq(${tmpCurr})`).removeClass('pop'),
        200
      );
    }
  }, 100);
}

function compress(direction) {
  let generateNewTile = false;

  for (let col = 0; col < BOARD_SIZE; col++) {
    let curr = col;

    for (let row = 0; row < BOARD_SIZE; row++) {
      const idx = col + row * BOARD_SIZE;

      if (curr >= idx || state[idx] === 0) continue;

      if (state[curr] === 0) {
        state[curr] = state[idx];
        state[idx] = 0;
        animate(idx, curr, direction);
        generateNewTile = true;
      } else if (state[curr] === state[idx]) {
        state[curr] *= 2; // Merge tiles
        state[idx] = 0;
        animate(idx, curr, direction, true);
        addToScore(state[curr]);
        curr += BOARD_SIZE;
        generateNewTile = true;
      } else {
        curr += BOARD_SIZE;
        if (curr !== idx) {
          state[curr] = state[idx];
          state[idx] = 0;
          animate(idx, curr, direction);
          generateNewTile = true;
        }
      }
    }
  }
  return generateNewTile;
}

function compressUp() {
  const generateNewTile = compress('up');
  if (generateNewTile) generateRandomTile();
  // checkGameStatus();
}

function compressDown() {
  state = state.reverse();
  const generateNewTile = compress('down');
  state = state.reverse();
  if (generateNewTile) generateRandomTile();
  // checkGameStatus();
}

function compressLeft() {
  rotateBoard();
  const generateNewTile = compress('left');
  rotateBoard();
  if (generateNewTile) generateRandomTile();
  // checkGameStatus();
}

function compressRight() {
  state = state.reverse();
  rotateBoard();
  const generateNewTile = compress('right');
  rotateBoard();
  state = state.reverse();
  if (generateNewTile) generateRandomTile();
  // checkGameStatus();
}

$(() => {
  BOARD_SIZE = +$('#board-size').val();

  // Listen to board size change
  $('#board-size').change(() => {
    BOARD_SIZE = +$('#board-size').val();
    $(':root').css('--board-size', BOARD_SIZE);
    initGame();
  });

  // Initialize the game
  initGame();

  // Reset the game
  $('#reset').click(() => initGame());

  // Handle keypresses
  $(document).keyup((e) => {
    // Do not process if animation is in progress
    let animationInProgress = false;

    $('.tile').each((_, elem) => {
      if ($(elem).attr('class').indexOf('move') !== -1) {
        animationInProgress = true;
      }
    });

    if (animationInProgress) return;

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
      case 82:
        initGame();
        break;
      default:
        break;
    }
  });
});

// TODO: add weight to the tiles
// todo: save cookies?

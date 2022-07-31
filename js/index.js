let BOARD_SIZE;
let state;

function isAnimationInProgress() {
  return $('.tile')
    .toArray()
    .some((elem) => $(elem).attr('class').indexOf('move') !== -1);
}

function incrementMoves() {
  $('#total-moves').text(+$('#total-moves').text() + 1);
}

function transposeBoard() {
  state = state.map(
    (_, idx) =>
      state[(idx % BOARD_SIZE) * BOARD_SIZE + Math.floor(idx / BOARD_SIZE)]
  );
}

function isMergePossible() {
  for (let col = 0; col < BOARD_SIZE; col++) {
    let curr = col;
    for (let row = 0; row < BOARD_SIZE; row++) {
      const idx = col + row * BOARD_SIZE;

      if (curr >= idx) continue;

      // A merge is possible!
      if (state[curr] === state[idx]) {
        return true;
      }

      curr += BOARD_SIZE;
    }
  }

  return false;
}

function checkGameStatus() {
  // Won
  if (state.includes(2048)) {
    alert('You won 🥳!');
    initGame();
  }

  // Check for empty tiles
  if (state.includes(0)) {
    return;
  }

  // Check for merges vertically and horizontally
  const mergePossibleV = isMergePossible();
  transposeBoard();
  const mergePossibleH = isMergePossible();
  transposeBoard();

  if (!mergePossibleV && !mergePossibleH) {
    alert('Game over 😔...');
    initGame();
  }
}

function getRandomTile() {
  let tile;
  do {
    tile = Math.floor(Math.random() * state.length);
  } while (state[tile] !== 0);
  return tile;
}

function generateNewTile() {
  setTimeout(() => {
    const tile = getRandomTile();
    const value = Math.random() < 0.8 ? 2 : 4;

    state[tile] = value;

    $(`.board-layout-tiles .tile:eq(${tile})`)
      .html(value)
      .addClass(`tile-${value} appear`);

    setTimeout(() => {
      $(`.board-layout-tiles .tile:eq(${tile})`).removeClass('appear');
      checkGameStatus();
    }, 200);
  }, 100);
}

function initGame() {
  // Set board size
  const size = +$('#board-size').val();
  BOARD_SIZE = size;
  $(':root').css('--board-size', size);

  // Fill board
  $('.board-layout').empty();
  for (let i = 0; i < BOARD_SIZE ** 2; i++) {
    $('.board-layout').append($('<div class="tile"></div>'));
  }

  // Initialize state
  state = new Array(BOARD_SIZE ** 2).fill(0);
  $('#total-moves').text(0);

  generateNewTile();
  generateNewTile();
}

function getAbsolutePositions(fromIdx, toIdx, direction) {
  let start;
  let end;

  switch (direction) {
    case 'up':
      return {
        start: fromIdx,
        end: toIdx,
        movingUnit: (toIdx - fromIdx) / BOARD_SIZE,
      };
    case 'down':
      return {
        start: BOARD_SIZE ** 2 - fromIdx - 1,
        end: BOARD_SIZE ** 2 - toIdx - 1,
        movingUnit: (fromIdx - toIdx) / BOARD_SIZE,
      };
    case 'left':
      start =
        (fromIdx % BOARD_SIZE) * BOARD_SIZE + Math.floor(fromIdx / BOARD_SIZE);
      end = (toIdx % BOARD_SIZE) * BOARD_SIZE + Math.floor(toIdx / BOARD_SIZE);
      return {
        start,
        end,
        movingUnit: end - start,
      };
    case 'right':
      start = BOARD_SIZE ** 2 - fromIdx - 1;
      end = BOARD_SIZE ** 2 - toIdx - 1;
      start =
        (start % BOARD_SIZE) * BOARD_SIZE + Math.floor(start / BOARD_SIZE);
      end = (end % BOARD_SIZE) * BOARD_SIZE + Math.floor(end / BOARD_SIZE);
      return {
        start,
        end,
        movingUnit: end - start,
      };
    default:
      return {};
  }
}

function animateTile(fromIdx, toIdx, direction, popTile) {
  const { start, end, movingUnit } = getAbsolutePositions(
    fromIdx,
    toIdx,
    direction,
  );

  // Amimate tile if non-empty
  if (
    $(`.board-layout-tiles .tile:eq(${start})`)
      .attr('class')
      .indexOf('tile-') !== 1
  ) {
    $(`.board-layout-tiles .tile:eq(${start})`)
      .addClass(
        `move-${
          direction === 'up' || direction === 'down' ? 'vertical' : 'horizontal'
        }`
      )
      .css('--moving-unit', movingUnit);
  }

  // Set timer to erase old tile and display new tile after the animation is done
  setTimeout(() => {
    // Erase old tile
    $(`.board-layout-tiles .tile:eq(${start})`)
      .html('')
      .css('--moving-unit', '')
      .removeClass()
      .addClass('tile');

    // Place new tile
    if (state[end]) {
      $(`.board-layout-tiles .tile:eq(${end})`)
        .html(state[end])
        .removeClass()
        .addClass(`tile tile-${state[end]} ${popTile ? 'pop' : ''}`);
    } else {
      $(`.board-layout-tiles .tile:eq(${end})`)
        .html('')
        .removeClass()
        .addClass(`tile`);
    }

    // Set timer to remove pop class
    if (popTile) {
      setTimeout(
        () => $(`.board-layout-tiles .tile:eq(${end})`).removeClass('pop'),
        200
      );
    }
  }, 100);
}

function compress(direction) {
  let boardChanged = false;

  for (let col = 0; col < BOARD_SIZE; col++) {
    let curr = col;

    for (let row = 0; row < BOARD_SIZE; row++) {
      const target = col + row * BOARD_SIZE;

      // Skip empty target tiles
      if (state[target] === 0) continue;

      // Find empty tile or mergeable tile
      while (
        state[curr] !== 0 &&
        state[curr] !== state[target] &&
        curr < target
      )
        curr += BOARD_SIZE;
      if (curr >= target) continue;

      // Merge
      if (state[curr] === state[target]) {
        state[curr] *= 2;
        state[target] = 0;
        animateTile(target, curr, direction, true);
        curr += BOARD_SIZE;

        // Move target tile to empty tile
      } else {
        state[curr] = state[target];
        state[target] = 0;
        animateTile(target, curr, direction);
      }

      boardChanged = true;
    }
  }

  if (boardChanged) {
    incrementMoves();
    generateNewTile();
  }
}

function compressUp() {
  compress('up');
}

function compressDown() {
  state = state.reverse();
  compress('down');
  state = state.reverse();
}

function compressLeft() {
  transposeBoard();
  compress('left');
  transposeBoard();
}

function compressRight() {
  state = state.reverse();
  transposeBoard();
  compress('right');
  transposeBoard();
  state = state.reverse();
}

// Debug function
function update() {
  state.forEach((value, idx) => {
    if (value === 0) {
      $(`.board-layout-tiles .tile:eq(${idx})`)
        .html('')
        .removeClass()
        .addClass('tile');
    } else {
      $(`.board-layout-tiles .tile:eq(${idx})`)
        .html(value)
        .removeClass()
        .addClass(`tile tile-${value}`);
    }
  });
}

// Debug function
function setBoardGameOver() {
  state = [8, 32, 8, 32, 16, 4, 16, 4, 8, 32, 8, 32, 16, 4, 16, 0];
  update();
}

// Debug function
function setBoardWin() {
  state = [1024, 0, 1024, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  update();
}

$(() => {
  // Initialize the game
  initGame();

  // Listen to board size change
  $('#board-size').change(initGame);

  // Reset the game
  $('#reset').click(initGame);

  // Handle keypresses
  $(document).keyup((e) => {
    // Do not process if an animation is in progress
    if (isAnimationInProgress()) return;

    switch (e.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        compressUp();
        break;
      case 's':
      case 'arrowdown':
        compressDown();
        break;
      case 'a':
      case 'arrowleft':
        compressLeft();
        break;
      case 'd':
      case 'arrowright':
        compressRight();
        break;
      case 'r':
        initGame();
        break;
      case '1':
        setBoardGameOver();
        break;
      case '2':
        setBoardWin();
        break;
      case '3':
        transposeBoard();
        update();
        break;
      case '4':
        state = state.reverse();
        update();
        break;
      default:
        break;
    }
  });
});

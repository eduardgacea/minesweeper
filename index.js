'use strict';

const boardSize = 16;
const bombPercentile = 0.16;
const totalBombCount = Math.floor(boardSize ** 2 * bombPercentile);
const boardEl = document.getElementById('board');
const resetBtn = document.getElementById('reset-btn');
resetBtn.addEventListener('click', reset);
const boardObj = [];
const counterEl = document.getElementById('counter');
const timerEl = document.getElementById('timer');
let remainingBombs = totalBombCount;
let isPlaying = true;
let gameTime = 0;
let intervalId;

// BOARD OBJECT GENERATION
for (let i = 0; i < boardSize; i++) {
  const row = [];
  for (let j = 0; j < boardSize; j++) {
    const cell = {
      i: i,
      j: j,
      isHidden: true,
      isBomb: false,
      isFlagged: false,
      neighbours: getCellNeighbours(i, j),
    };
    row.push(cell);
  }
  boardObj.push(row);
}

bombGeneration();
countGeneration();
counterEl.textContent = String(remainingBombs).padStart(3, '0');

// BOARD ELEMENT GENERATION
for (let i = 0; i < boardSize; i++) {
  const row = document.createElement('div');
  row.id = `row-${i}`;
  row.classList.add('row');
  for (let j = 0; j < boardSize; j++) {
    const cell = document.createElement('div');
    cell.id = `cell-${i}-${j}`;
    cell.classList.add('cell');
    cell.classList.add('hidden');
    cell.addEventListener('click', () => {
      if (isPlaying) chordHandler(i, j);
    });
    cell.addEventListener('click', () => {
      if (isPlaying) clickHandler(i, j);
    });
    cell.addEventListener('contextmenu', e => {
      e.preventDefault();
      if (isPlaying) flagHandler(i, j);
    });
    row.appendChild(cell);
  }
  boardEl.appendChild(row);
}

function clickHandler(i, j) {
  if (boardObj[i][j].isFlagged || !boardObj[i][j].isHidden) return;
  if (!intervalId) intervalId = startTimer();
  else {
    clearInterval(intervalId);
    intervalId = startTimer();
  }
  const cell = document.getElementById(`cell-${i}-${j}`);
  cell.classList.add('unhidden');
  boardObj[i][j].isHidden = false;
  if (boardObj[i][j].isBomb) {
    // IF A BOMB CELL IS CLICKED
    cell.textContent = '💣';
    cell.classList.add('bomb');
    resetBtn.textContent = '😣';
    loseGame();
  } else {
    // IF A NON BOMB CELL IS HIT
    const gameState = checkWin();
    if (gameState) {
      resetBtn.textContent = '😎';
      return;
    }
    if (boardObj[i][j].count) cell.textContent = boardObj[i][j].count;
    cell.classList.remove('hidden');
    cell.classList.add('unhidden');
    switch (boardObj[i][j].count) {
      case 1:
        cell.classList.add('one');
        break;
      case 2:
        cell.classList.add('two');
        break;
      case 3:
        cell.classList.add('three');
        break;
      case 4:
        cell.classList.add('four');
        break;
      case 5:
        cell.classList.add('five');
        break;
      case 6:
        cell.classList.add('six');
        break;
      case 7:
        cell.classList.add('seven');
        break;
      case 8:
        cell.classList.add('eight');
        break;
      default:
        break;
    }
  }

  // FLOOD-FILL
  if (boardObj[i][j].count === 0) {
    boardObj[i][j].neighbours.forEach(neighbour => {
      clickHandler(neighbour[0], neighbour[1]);
    });
  }
}

function flagHandler(i, j) {
  if (boardObj[i][j].isHidden === false) return;
  const cell = document.getElementById(`cell-${i}-${j}`);
  if (boardObj[i][j].isFlagged) {
    cell.textContent = '';
    remainingBombs++;
    counterEl.textContent = String(remainingBombs).padStart(3, '0');
    boardObj[i][j].isFlagged = false;
  } else {
    cell.textContent = '🚩';
    remainingBombs--;
    counterEl.textContent = String(remainingBombs).padStart(3, '0');
    boardObj[i][j].isFlagged = true;
    const gameState = checkWin();
    if (gameState) {
      resetBtn.textContent = '😎';
      return;
    }
  }
}

function reset() {
  if (intervalId) {
    clearInterval(intervalId);
    gameTime = 0;
    timerEl.textContent = String(gameTime).padStart(3, '0');
  }
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      cell.textContent = '';
      cell.classList.add('hidden');
      cell.classList.remove('unhidden');
      cell.classList.remove('bomb');
      cell.classList.remove('one');
      cell.classList.remove('two');
      cell.classList.remove('three');
      cell.classList.remove('four');
      cell.classList.remove('five');
      cell.classList.remove('six');
      cell.classList.remove('seven');
      cell.classList.remove('eight');
      boardObj[i][j].isHidden = true;
      boardObj[i][j].isBomb = false;
      boardObj[i][j].isFlagged = false;
      resetBtn.textContent = '🙂';
      remainingBombs = totalBombCount;
      counterEl.textContent = String(remainingBombs).padStart(3, '0');
    }
  }
  bombGeneration();
  countGeneration();
  isPlaying = true;
}

function bombGeneration() {
  const bombsPos = new Set();
  while (bombsPos.size < totalBombCount) {
    bombsPos.add(Math.floor(Math.random() * boardSize * boardSize));
  }
  for (const bombPos of bombsPos) {
    const i = Math.floor(bombPos / boardSize);
    const j = bombPos % boardSize;
    boardObj[i][j].isBomb = true;
  }
}

function countGeneration() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (boardObj[i][j].isBomb === false) {
        boardObj[i][j].count = bombsInCellNeighbours(i, j);
      } else {
        boardObj[i][j].count = -1;
      }
    }
  }
}

function getCellNeighbours(i, j) {
  let neighbours = [];
  // TOP LEFT CORNER
  if (i === 0 && j === 0) {
    neighbours.push([0, 1], [1, 0], [1, 1]);
  }
  // TOP RIGHT CORNER
  if (i === 0 && j === boardSize - 1) {
    neighbours.push([0, boardSize - 2], [1, boardSize - 2], [1, boardSize - 1]);
  }
  // BOTTOM LEFT CORNER
  if (i === boardSize - 1 && j === 0) {
    neighbours.push([boardSize - 2, 0], [boardSize - 2, 1], [boardSize - 1, 1]);
  }
  // BOTTOM RIGHT CORNER
  if (i === boardSize - 1 && j === boardSize - 1) {
    neighbours.push([boardSize - 1, boardSize - 2], [boardSize - 2, boardSize - 2], [boardSize - 2, boardSize - 1]);
  }
  // TOP EDGE
  if (i === 0 && j > 0 && j < boardSize - 1) {
    neighbours.push([i, j - 1], [i + 1, j - 1], [i + 1, j], [i + 1, j + 1], [i, j + 1]);
  }
  // BOTTOM EDGE
  if (i === boardSize - 1 && j > 0 && j < boardSize - 1) {
    neighbours.push([i, j - 1], [i - 1, j - 1], [i - 1, j], [i - 1, j + 1], [i, j + 1]);
  }
  // LEFT EDGE
  if (j === 0 && i > 0 && i < boardSize - 1) {
    neighbours.push([i - 1, j], [i - 1, j + 1], [i, j + 1], [i + 1, j + 1], [i + 1, j]);
  }
  // RIGHT EDGE
  if (j === boardSize - 1 && i > 0 && i < boardSize - 1) {
    neighbours.push([i - 1, j], [i - 1, j - 1], [i, j - 1], [i + 1, j - 1], [i + 1, j]);
  }
  // DEFAULT CASE
  if (i > 0 && (i < boardSize - 1) & (j > 0) && j < boardSize - 1) {
    neighbours.push([i - 1, j - 1], [i - 1, j], [i - 1, j + 1], [i, j - 1], [i, j + 1], [i + 1, j - 1], [i + 1, j], [i + 1, j + 1]);
  }
  return neighbours;
}

function bombsInCellNeighbours(i, j) {
  let count = 0;
  let neighbours = getCellNeighbours(i, j);
  for (let neighbour of neighbours) {
    count += Number(boardObj[neighbour[0]][neighbour[1]].isBomb);
  }
  return count;
}

function chordHandler(i, j) {
  if (boardObj[i][j].isFlagged || boardObj[i][j].isHidden) return;
  const neighboursIdx = boardObj[i][j].neighbours;
  const neighbours = [];
  let flaggedNeighboursCount = 0;
  for (const neighbourIdx of neighboursIdx) {
    neighbours.push(boardObj[neighbourIdx[0]][neighbourIdx[1]]);
  }
  for (let neighbour of neighbours) {
    if (neighbour.isFlagged) flaggedNeighboursCount++;
  }
  if (boardObj[i][j].count === flaggedNeighboursCount) {
    for (let neighbour of neighbours) {
      if (neighbour.isHidden && !neighbour.isFlagged) {
        neighbour.isHidden = false;
        const cell = document.getElementById(`cell-${neighbour.i}-${neighbour.j}`);
        cell.classList.remove('hidden');
        cell.classList.add('unhidden');
        switch (boardObj[neighbour.i][neighbour.j].count) {
          case 1:
            cell.classList.add('one');
            break;
          case 2:
            cell.classList.add('two');
            break;
          case 3:
            cell.classList.add('three');
            break;
          case 4:
            cell.classList.add('four');
            break;
          case 5:
            cell.classList.add('five');
            break;
          case 6:
            cell.classList.add('six');
            break;
          case 7:
            cell.classList.add('seven');
            break;
          case 8:
            cell.classList.add('eight');
            break;
          default:
            break;
        }
        // IF A NON BOMB CELL IS HIT
        if (!boardObj[neighbour.i][neighbour.j].isBomb) {
          cell.textContent = boardObj[neighbour.i][neighbour.j].count ? boardObj[neighbour.i][neighbour.j].count : '';
          const gameState = checkWin();
          if (gameState) {
            resetBtn.textContent = '😎';
            return;
          }
        } else {
          // IF A BOMB CELL IS HIT
          cell.textContent = '💣';
          cell.classList.add('bomb');
          resetBtn.textContent = '😣';
          loseGame();
        }
        if (!boardObj[neighbour.i][neighbour.j].count) {
          boardObj[neighbour.i][neighbour.j].neighbours.forEach(neighbour => {
            clickHandler(neighbour[0], neighbour[1]);
          });
        }
      }
    }
  }
}

function loseGame() {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (boardObj[i][j].isBomb) {
        const bombCell = document.getElementById(`cell-${i}-${j}`);
        bombCell.classList.remove('hidden');
        bombCell.classList.add('unhidden');
        bombCell.textContent = '💣';
      }
    }
  }
  isPlaying = false;
}

function checkWin() {
  let unhidden = 0;
  let flagged = 0;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (boardObj[i][j].isFlagged) flagged++;
      if (!boardObj[i][j].isHidden) unhidden++;
    }
  }
  if (unhidden + flagged === boardSize ** 2) {
    stopTimer();
    isPlaying = false;
    return unhidden + flagged === boardSize ** 2 ? 1 : 0;
  }
}

function startTimer() {
  const intervalId = setInterval(() => {
    gameTime++;
    timerEl.textContent = String(gameTime).padStart(3, '0');
  }, 1000);
  return intervalId;
}

function stopTimer() {
  clearInterval(intervalId);
}

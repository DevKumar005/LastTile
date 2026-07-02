import { soundManager } from './sound.js';
import { PuzzleSolver } from './solver.js';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://lasttile-backend.onrender.com'; // Replace this with your actual deployed Render API URL


function toRoman(num) {
  const lookup = [
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let res = '';
  for (const [v, s] of lookup) {
    while (num >= v) {
      res += s;
      num -= v;
    }
  }
  return res;
}

const GREEK_LETTERS = [
  'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ',
  'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω',
  'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ', 'Λ', 'Μ'
];

const SYMBOLS_LIST = [
  '★', '✦', '⬢', '▲', '■', '◆', '●', '♠', '♣', '♥',
  '♦', '⚡', '💎', '🔮', '👑', '☯', '🔥', '🌀', '⚛', '⚓',
  '🎯', '🪐', '🚀', '⛵', '🎨', '⚙', '🗝', '⚜', '💠', '🛡',
  '🗡', '🏆', '🔔', '🌙', '☀️', '⭐'
];

export class PuzzleEngine {
  constructor(size = 4, containerEl, onStateChange) {
    this.size = size;
    this.container = containerEl;
    this.onStateChange = onStateChange;

    this.board = [];
    this.moves = 0;
    this.startTime = null;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.isSolved = false;
    this.isAutoSolving = false;
    this.mode = 'numbers'; // 'numbers' | 'alphabet' | 'roman' | 'greek' | 'symbols' | 'colors' | 'picture'
    this.imageCanvasTiles = null; // Optional custom image canvas slices

    this.initBoard();
  }

  setSize(newSize) {
    this.size = newSize;
    this.reset();
  }

  setImageTiles(tilesMap) {
    this.imageCanvasTiles = tilesMap;
    this.mode = 'picture';
    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    this.render();
  }

  clearImageTiles() {
    this.imageCanvasTiles = null;
    this.render();
  }

  initBoard() {
    this.board = Array.from({ length: this.size * this.size }, (_, i) =>
      i === this.size * this.size - 1 ? 0 : i + 1
    );
  }
  isSolvable(arr, N) {
    let inversions = 0;
    const flatWithoutEmpty = arr.filter((val) => val !== 0);

    for (let i = 0; i < flatWithoutEmpty.length; i++) {
      for (let j = i + 1; j < flatWithoutEmpty.length; j++) {
        if (flatWithoutEmpty[i] > flatWithoutEmpty[j]) {
          inversions++;
        }
      }
    }

    if (N % 2 !== 0) {
      return inversions % 2 === 0;
    } else {
      const emptyIdx = arr.indexOf(0);
      const emptyRowFromBottom = N - Math.floor(emptyIdx / N);
      if (emptyRowFromBottom % 2 === 0) {
        return inversions % 2 !== 0;
      } else {
        return inversions % 2 === 0;
      }
    }
  }

  shuffle(seed = null) {
    this.stopTimer();
    this.moves = 0;
    this.elapsedSeconds = 0;
    this.isSolved = false;
    this.isAutoSolving = false;

    let arr;
    const total = this.size * this.size;
    const goalStr = Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1)).join(',');

    let a = seed !== null ? seed : Math.floor(Math.random() * 2147483647);
    const rand = () => {
      a |= 0;
      a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
    const nextRandom = seed !== null ? rand : Math.random;
    do {
      arr = Array.from({ length: total }, (_, i) => (i === total - 1 ? 0 : i + 1));
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(nextRandom() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!this.isSolvable(arr, this.size) || arr.join(',') === goalStr);

    this.board = arr;
    soundManager.playShuffle();
    this.render();
    this.notifyState();
  }

  reset() {
    this.stopTimer();
    this.moves = 0;
    this.elapsedSeconds = 0;
    this.isSolved = false;
    this.isAutoSolving = false;
    this.initBoard();
    this.render();
    this.notifyState();
  }

  loadState(state) {
    this.stopTimer();
    this.board = [...state.board];
    this.moves = state.moves;
    this.elapsedSeconds = state.seconds;
    this.isSolved = state.isSolved;
    this.isAutoSolving = false;
    this.render();
    this.notifyState();
  }

  startTimer() {
    if (this.timerInterval) return;
    this.startTime = Date.now() - this.elapsedSeconds * 1000;
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.notifyState();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  getEmptyIndex() {
    return this.board.indexOf(0);
  }

  getTileCoords(index) {
    return {
      row: Math.floor(index / this.size),
      col: index % this.size
    };
  }

  canMove(index) {
    if (this.isSolved || this.isAutoSolving) return false;
    const emptyIdx = this.getEmptyIndex();
    const tileCoords = this.getTileCoords(index);
    const emptyCoords = this.getTileCoords(emptyIdx);

    const rowDiff = Math.abs(tileCoords.row - emptyCoords.row);
    const colDiff = Math.abs(tileCoords.col - emptyCoords.col);

    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  moveTileByValue(val) {
    const index = this.board.indexOf(val);
    if (index !== -1) {
      return this.moveTile(index);
    }
    return false;
  }

  moveTile(index) {
    if (!this.canMove(index)) return false;

    if (this.moves === 0 && !this.timerInterval) {
      this.startTimer();
    }

    const emptyIdx = this.getEmptyIndex();
    [this.board[index], this.board[emptyIdx]] = [this.board[emptyIdx], this.board[index]];
    this.moves++;

    soundManager.playSlide();
    this.checkVictory();
    this.render();
    this.notifyState();
    return true;
  }
  moveByDirection(dir) {
    if (this.isSolved || this.isAutoSolving) return;
    const emptyIdx = this.getEmptyIndex();
    const { row, col } = this.getTileCoords(emptyIdx);

    let targetRow = row;
    let targetCol = col;
    if (dir === 'ArrowUp' || dir === 'w') targetRow = row + 1;
    if (dir === 'ArrowDown' || dir === 's') targetRow = row - 1;
    if (dir === 'ArrowLeft' || dir === 'a') targetCol = col + 1;
    if (dir === 'ArrowRight' || dir === 'd') targetCol = col - 1;

    if (targetRow >= 0 && targetRow < this.size && targetCol >= 0 && targetCol < this.size) {
      const targetIdx = targetRow * this.size + targetCol;
      this.moveTile(targetIdx);
    }
  }

  checkVictory() {
    const total = this.size * this.size;
    let victory = true;
    for (let i = 0; i < total - 1; i++) {
      if (this.board[i] !== i + 1) {
        victory = false;
        break;
      }
    }
    if (this.board[total - 1] !== 0) victory = false;

    if (victory) {
      this.isSolved = true;
      this.stopTimer();
      soundManager.playVictory();
    }
  }

  async autoSolve() {
    if (this.isSolved || this.isAutoSolving) return;

    let solutionPath = null;
    let usedPython = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch(`${API_BASE_URL}/api/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board: this.board, size: this.size }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && Array.isArray(data.solution)) {
          solutionPath = data.solution;
          usedPython = true;
        }
      }
    } catch (e) {
    }
    if (!solutionPath) {
      const solver = new PuzzleSolver(this.size);
      solutionPath = solver.solve(this.board);
    }

    if (!solutionPath || solutionPath.length === 0) {
      alert('No solution path found or board is already solved!');
      return;
    }

    this.isAutoSolving = true;
    this.notifyState();

    const stepDelay = this.size >= 5 ? 70 : (this.size === 4 ? 140 : 200);

    for (const step of solutionPath) {
      if (!this.isAutoSolving) break;
      await new Promise((resolve) => setTimeout(resolve, stepDelay));

      const emptyIdx = this.getEmptyIndex();
      const tileIdx = this.board.indexOf(step.movedTile);
      if (tileIdx !== -1) {
        [this.board[tileIdx], this.board[emptyIdx]] = [this.board[emptyIdx], this.board[tileIdx]];
        this.moves++;
        soundManager.playSlide();
        this.render();
        this.notifyState();
      }
    }

    this.isAutoSolving = false;
    this.checkVictory();
    this.notifyState();
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        board: [...this.board],
        moves: this.moves,
        seconds: this.elapsedSeconds,
        isSolved: this.isSolved,
        isAutoSolving: this.isAutoSolving,
        size: this.size
      });
    }
  }

  render() {
    const N = this.size;
    const tileSizePercent = 100 / N;
    const gapPx = N >= 5 ? 6 : 8;
    const existingMap = new Map();
    this.container.querySelectorAll('.tile').forEach((el) => {
      const val = parseInt(el.getAttribute('data-tile'), 10);
      existingMap.set(val, el);
    });

    const needsFullRebuild =
      existingMap.size !== N * N - 1 ||
      this._lastRenderMode !== this.mode ||
      this._lastRenderSize !== N;

    if (needsFullRebuild) {
      this.container.innerHTML = '';
      this._lastRenderMode = this.mode;
      this._lastRenderSize = N;
    }

    this.board.forEach((val, index) => {
      if (val === 0) return; // Empty slot

      const row = Math.floor(index / N);
      const col = index % N;

      const leftStyle = `calc(${col * tileSizePercent}% + ${gapPx / 2}px)`;
      const topStyle = `calc(${row * tileSizePercent}% + ${gapPx / 2}px)`;

      let tileEl = !needsFullRebuild ? existingMap.get(val) : null;

      if (tileEl) {
        tileEl.style.left = leftStyle;
        tileEl.style.top = topStyle;
        tileEl.setAttribute('data-index', index);
      } else {
        tileEl = document.createElement('div');
        tileEl.className = 'tile';
        tileEl.setAttribute('data-tile', val);
        tileEl.setAttribute('data-index', index);

        tileEl.style.width = `calc(${tileSizePercent}% - ${gapPx}px)`;
        tileEl.style.height = `calc(${tileSizePercent}% - ${gapPx}px)`;
        tileEl.style.left = leftStyle;
        tileEl.style.top = topStyle;

        if (this.imageCanvasTiles && this.imageCanvasTiles[val] && this.mode === 'picture') {
          const imgDiv = document.createElement('div');
          imgDiv.className = 'tile-image';
          imgDiv.style.backgroundImage = `url(${this.imageCanvasTiles[val]})`;
          tileEl.appendChild(imgDiv);

          const badge = document.createElement('span');
          badge.className = 'tile-number-badge';
          badge.textContent = val;
          tileEl.appendChild(badge);
        } else if (this.mode === 'alphabet') {
          const charCode = 64 + val;
          const letter = String.fromCharCode(charCode);
          const inner = document.createElement('div');
          inner.className = 'tile-inner';
          inner.textContent = letter;
          tileEl.appendChild(inner);
        } else if (this.mode === 'roman') {
          const inner = document.createElement('div');
          inner.className = 'tile-inner';
          inner.style.fontSize = N >= 5 ? '0.9rem' : (N === 4 ? '1.3rem' : '1.7rem');
          inner.textContent = toRoman(val);
          tileEl.appendChild(inner);
        } else if (this.mode === 'greek') {
          const inner = document.createElement('div');
          inner.className = 'tile-inner';
          inner.textContent = GREEK_LETTERS[(val - 1) % GREEK_LETTERS.length];
          tileEl.appendChild(inner);
        } else if (this.mode === 'symbols') {
          const inner = document.createElement('div');
          inner.className = 'tile-inner';
          inner.style.fontSize = N >= 5 ? '1.2rem' : '1.8rem';
          inner.textContent = SYMBOLS_LIST[(val - 1) % SYMBOLS_LIST.length];
          tileEl.appendChild(inner);
        } else {
          const inner = document.createElement('div');
          inner.className = 'tile-inner';
          inner.textContent = val;
          tileEl.appendChild(inner);
        }

        if (N >= 5 && this.mode !== 'roman' && this.mode !== 'symbols') {
          tileEl.style.fontSize = N === 5 ? '1.3rem' : '1.1rem';
        }

        tileEl.addEventListener('click', () => this.moveTileByValue(val));
        this.container.appendChild(tileEl);
      }
    });
  }
}

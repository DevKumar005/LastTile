
import { soundManager } from './sound.js';

export class KlotskiEngine {
  constructor(containerEl, onStateChange) {
    this.container = containerEl;
    this.onStateChange = onStateChange;

    this.cols = 4;
    this.rows = 5;
    this.initialBlocks = [
      { id: 'target', x: 1, y: 0, w: 2, h: 2, isTarget: true, label: '★' },
      { id: 'v1', x: 0, y: 0, w: 1, h: 2, label: '❚' },
      { id: 'v2', x: 3, y: 0, w: 1, h: 2, label: '❚' },
      { id: 'v3', x: 0, y: 2, w: 1, h: 2, label: '❚' },
      { id: 'v4', x: 3, y: 2, w: 1, h: 2, label: '❚' },
      { id: 'h1', x: 1, y: 2, w: 2, h: 1, label: '▬' },
      { id: 's1', x: 1, y: 3, w: 1, h: 1, label: '●' },
      { id: 's2', x: 2, y: 3, w: 1, h: 1, label: '●' },
      { id: 's3', x: 0, y: 4, w: 1, h: 1, label: '●' },
      { id: 's4', x: 3, y: 4, w: 1, h: 1, label: '●' }
    ];

    this.blocks = JSON.parse(JSON.stringify(this.initialBlocks));
    this.moves = 0;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.isSolved = false;

    this.selectedBlock = null;
    this.dragStart = { x: 0, y: 0 };
  }

  reset() {
    this.stopTimer();
    this.blocks = JSON.parse(JSON.stringify(this.initialBlocks));
    this.moves = 0;
    this.elapsedSeconds = 0;
    this.isSolved = false;
    soundManager.playShuffle();
    this.render();
    this.notifyState();
  }

  startTimer() {
    if (this.timerInterval) return;
    const startTime = Date.now() - this.elapsedSeconds * 1000;
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      this.notifyState();
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  getGridState() {
    const grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    for (const b of this.blocks) {
      for (let r = b.y; r < b.y + b.h; r++) {
        for (let c = b.x; c < b.x + b.w; c++) {
          grid[r][c] = b.id;
        }
      }
    }
    return grid;
  }

  canMove(block, dx, dy) {
    if (this.isSolved) return false;
    const newX = block.x + dx;
    const newY = block.y + dy;
    if (newX < 0 || newX + block.w > this.cols || newY < 0 || newY + block.h > this.rows) {
      return false;
    }

    const grid = this.getGridState();
    for (let r = newY; r < newY + block.h; r++) {
      for (let c = newX; c < newX + block.w; c++) {
        const occupiedId = grid[r][c];
        if (occupiedId !== null && occupiedId !== block.id) {
          return false;
        }
      }
    }

    return true;
  }

  moveBlock(blockId, dx, dy) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (!block) return false;

    if (this.canMove(block, dx, dy)) {
      if (this.moves === 0 && !this.timerInterval) {
        this.startTimer();
      }

      block.x += dx;
      block.y += dy;
      this.moves++;

      soundManager.playSlide();
      if (block.isTarget && block.x === 1 && block.y === 3) {
        this.isSolved = true;
        this.stopTimer();
        soundManager.playVictory();
      }

      this.render();
      this.notifyState();
      return true;
    }
    return false;
  }

  notifyState() {
    if (this.onStateChange) {
      this.onStateChange({
        moves: this.moves,
        seconds: this.elapsedSeconds,
        isSolved: this.isSolved,
        size: 'Klotski'
      });
    }
  }

  render() {
    this.container.innerHTML = '';
    const colPct = 100 / this.cols;
    const rowPct = 100 / this.rows;
    const gapPx = 6;
    const exitMarker = document.createElement('div');
    exitMarker.className = 'klotski-exit';
    this.container.appendChild(exitMarker);

    this.blocks.forEach((block) => {
      const el = document.createElement('div');
      el.className = `klotski-tile ${block.isTarget ? 'red-donkey' : ''}`;
      el.setAttribute('data-id', block.id);

      el.style.width = `calc(${block.w * colPct}% - ${gapPx}px)`;
      el.style.height = `calc(${block.h * rowPct}% - ${gapPx}px)`;
      el.style.left = `calc(${block.x * colPct}% + ${gapPx / 2}px)`;
      el.style.top = `calc(${block.y * rowPct}% + ${gapPx / 2}px)`;

      const inner = document.createElement('span');
      inner.textContent = block.label;
      inner.style.fontSize = block.isTarget ? '2rem' : '1.2rem';
      el.appendChild(inner);
      let pointerStartX = 0;
      let pointerStartY = 0;

      el.addEventListener('pointerdown', (e) => {
        pointerStartX = e.clientX;
        pointerStartY = e.clientY;
        el.setPointerCapture(e.pointerId);
      });

      el.addEventListener('pointerup', (e) => {
        const deltaX = e.clientX - pointerStartX;
        const deltaY = e.clientY - pointerStartY;
        const threshold = 20;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > threshold) this.moveBlock(block.id, 1, 0);
          else if (deltaX < -threshold) this.moveBlock(block.id, -1, 0);
        } else {
          if (deltaY > threshold) this.moveBlock(block.id, 0, 1);
          else if (deltaY < -threshold) this.moveBlock(block.id, 0, -1);
        }
      });

      this.container.appendChild(el);
    });
  }
}

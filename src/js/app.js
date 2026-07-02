
import confetti from 'canvas-confetti';
import { soundManager } from './sound.js';
import { PuzzleEngine } from './puzzleEngine.js';
import { KlotskiEngine } from './klotskiEngine.js';
import { ImageCutter } from './imageCutter.js';

const PUZZLE_FACTS = [
  {
    tag: 'Historical Fact',
    text: 'The 15 Puzzle was invented by Noyes Chapman, a postmaster in Canastota, New York, in 1880!'
  },
  {
    tag: 'Famous Hoax',
    text: 'Puzzle master Sam Loyd offered a $1,000 reward for solving a 14-15 swapped grid—unaware it was mathematically impossible!'
  },
  {
    tag: 'Mathematical Limit',
    text: 'There are over 20 trillion (16!) possible tile arrangements, but exactly half of them are impossible to solve due to parity!'
  },
  {
    tag: 'Rubik\'s Ancestor',
    text: 'Ernő Rubik was directly inspired by 2D sliding tile mechanics when conceiving the 3D Rubik\'s Cube in 1974.'
  },
  {
    tag: 'Pro Strategy',
    text: 'Solve row-by-row! Complete the top row first (1-4), then the second row (5-8), reducing the puzzle into a smaller sub-grid.'
  },
  {
    tag: 'Corner Trick',
    text: 'When solving the right end of a row (like 3 and 4), place 4 in the corner first, position 3 right below it, and rotate both into place!'
  },
  {
    tag: 'Parity Rule',
    text: 'Swapping any two adjacent tiles changes the permutation parity, rendering an otherwise solvable board completely unsolvable.'
  },
  {
    tag: 'Optimal Moves',
    text: 'Finding the shortest solution path to an N-puzzle is NP-hard. The hardest 15-puzzle configurations require 80 single tile moves!'
  },
  {
    tag: '15-Puzzle Craze',
    text: 'In 1880, "15-puzzle fever" swept America & Europe. Employers posted notices banning workers from playing during office hours!'
  },
  {
    tag: 'A* Algorithm',
    text: 'Computer solvers use the A* search algorithm with Manhattan Distance and Linear Conflict heuristics to calculate optimal moves in milliseconds.'
  },
  {
    tag: 'God\'s Number',
    text: 'For the 8-puzzle (3x3 grid), any solvable starting configuration can be solved in 31 moves or fewer!'
  },
  {
    tag: 'Fringe Strategy',
    text: 'The fringe method solves the outermost row and column first, systematically shrinking an N×N board into an (N-1)×(N-1) board.'
  },
  {
    tag: 'Klotski History',
    text: 'Klotski block puzzles originated in early 20th-century China (known as Huarong Road), named after a famous historic escape maneuver.'
  },
  {
    tag: 'Slide vs Lift',
    text: 'Mechanical sliding puzzles were invented as an alternative to jigsaw puzzles so tiles couldn\'t fall off or get lost while travelling!'
  },
  {
    tag: 'Inversion Count',
    text: 'You can test solvability in seconds by counting tile inversions: an odd number of inversions on odd grids is always unsolvable!'
  },
  {
    tag: 'Speedcubing Tech',
    text: 'Modern speed-solvers memorize 4x4 block maneuvers to slide multiple tiles in a single fluid sweeping motion!'
  }
];

class App {
  constructor() {
    this.currentMode = 'numbers'; // 'numbers' | 'alphabet' | 'roman' | 'greek' | 'symbols' | 'daily' | 'picture' | 'klotski'
    this.currentGridSize = 4;
    this.activePreset = null;
    this.customImageSrc = null;
    this.factIndex = 0;

    this.boardEl = document.getElementById('puzzle-board');
    this.puzzleEngine = null;
    this.klotskiEngine = null;

    this.initAudioUI();
    this.initEngines();
    this.initPresetsUI();
    this.initRecordsUI();
    this.initFactsUI();
    this.initViewNavigation();
    this.initHeroTriviaCarousel();
    this.initEventListeners();
    this.initKeyboardAndTouch();
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  initViewNavigation() {
    const landingView = document.getElementById('landing-view');
    const gameView = document.getElementById('game-view');

    this.renderGameView = (mode = 'numbers', size = 4) => {
      this.showLoader(400, () => {
        if (landingView) landingView.style.display = 'none';
        if (gameView) gameView.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.currentMode = mode;
        this.currentGridSize = size;
        this.puzzleEngine.setSize(size);
        
        const modeBtnId = `btn-mode-${mode}`;
        this.updateModeUI(modeBtnId);
        this.puzzleEngine.setMode(mode === 'daily' ? 'numbers' : mode);
        this.puzzleEngine.clearImageTiles();
        this.puzzleEngine.shuffle();
        if (window.lucide) window.lucide.createIcons();
      });
    };

    this.renderHomeView = () => {
      this.showLoader(400, () => {
        if (gameView) gameView.style.display = 'none';
        if (landingView) landingView.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    };

    this.openGame = (mode = 'numbers', size = 4) => {
      soundManager.playClick();
      if (location.hash !== '#play') {
        history.pushState({ view: 'game' }, '', '#play');
      }
      this.renderGameView(mode, size);
    };

    this.openHome = () => {
      soundManager.playClick();
      if (location.hash === '#play') {
        history.pushState({ view: 'home' }, '', '#home');
      }
      this.renderHomeView();
    };
    window.addEventListener('popstate', () => {
      if (location.hash === '#play') {
        this.renderGameView(this.currentMode, this.currentGridSize);
      } else {
        this.renderHomeView();
      }
    });
    if (location.hash) {
      history.replaceState(null, '', window.location.pathname);
    }
    this.renderHomeView();
    ['btn-hero-play', 'btn-start-game-cta', 'btn-cta-launch'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => this.openGame());
    });
    ['btn-nav-home', 'btn-logo-home'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', () => this.openHome());
    });
  }

  showLoader(duration = 400, callback) {
    const overlay = document.getElementById('loader-overlay');
    if (!overlay) {
      if (callback) callback();
      return;
    }
    overlay.classList.remove('hidden');

    let executed = false;
    const execute = () => {
      if (!executed) {
        executed = true;
        if (callback) {
          try {
            callback();
          } catch (e) {
            console.error('Loader callback error:', e);
          }
        }
        setTimeout(() => {
          overlay.classList.add('hidden');
        }, 200);
      }
    };

    setTimeout(execute, duration);
  }

  initHeroTriviaCarousel() {
    let heroFactIdx = 0;
    const quoteEl = document.getElementById('hero-trivia-quote');
    const tagEl = document.getElementById('hero-trivia-tag');

    const updateHeroTrivia = () => {
      if (!quoteEl || !tagEl) return;
      heroFactIdx = (heroFactIdx + 1) % PUZZLE_FACTS.length;
      const f = PUZZLE_FACTS[heroFactIdx];
      quoteEl.textContent = `"${f.text}"`;
      tagEl.textContent = f.tag;
    };

    setInterval(updateHeroTrivia, 5000);
  }

  initAudioUI() {
    const btn = document.getElementById('btn-audio');
    if (!btn) return;
    
    btn.innerHTML = `<i data-lucide="${soundManager.isMuted ? 'volume-x' : 'volume-2'}"></i>`;
    if (window.lucide) window.lucide.createIcons();
    
    btn.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      btn.innerHTML = `<i data-lucide="${isMuted ? 'volume-x' : 'volume-2'}"></i>`;
      if (window.lucide) window.lucide.createIcons();
    });
  }

  initEngines() {
    this.puzzleEngine = new PuzzleEngine(
      this.currentGridSize,
      this.boardEl,
      (state) => this.onGameStateUpdate(state)
    );
    this.klotskiEngine = new KlotskiEngine(
      this.boardEl,
      (state) => this.onGameStateUpdate(state)
    );
    this.puzzleEngine.shuffle();
    this.updatePresetVisibility();
  }

  handleVictory(state) {
    const key = `best_${state.size}`;
    const prevBest = localStorage.getItem(key);
    if (!prevBest || state.seconds < parseInt(prevBest, 10)) {
      localStorage.setItem(key, state.seconds.toString());
      this.initRecordsUI();
    }
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
    const minutes = String(Math.floor(state.seconds / 60)).padStart(2, '0');
    const secs = String(state.seconds % 60).padStart(2, '0');
    const finalTimeEl = document.getElementById('modal-final-time');
    const finalMovesEl = document.getElementById('modal-final-moves');
    if (finalTimeEl) finalTimeEl.textContent = `${minutes}:${secs}`;
    if (finalMovesEl) finalMovesEl.textContent = state.moves;

    const modal = document.getElementById('victory-modal');
    if (modal) modal.classList.add('open');
  }

  async loadPictureMode(imageSrc) {
    this.customImageSrc = imageSrc;
    this.currentMode = 'picture';
    this.updateModeUI('btn-mode-picture');

    document.getElementById('grid-size-controls').style.display = 'flex';
    document.getElementById('btn-auto-solve').style.display = 'inline-flex';

    try {
      const sliced = await ImageCutter.sliceImage(imageSrc, this.currentGridSize);
      this.puzzleEngine.setImageTiles(sliced);
      this.puzzleEngine.shuffle();
    } catch (err) {
      this.showToast('Failed to load image tiles.');
    }
  }

  initPresetsUI() {
    const presets = ImageCutter.getPresetImages();
    const container = document.getElementById('preset-grid');
    if (!container) return;
    container.innerHTML = '';

    presets.forEach((preset, idx) => {
      const item = document.createElement('div');
      item.className = `preset-item ${idx === 0 ? 'active' : ''}`;
      item.style.backgroundImage = `url(${preset.url})`;

      const label = document.createElement('span');
      label.className = 'preset-label';
      label.textContent = preset.name;
      item.appendChild(label);

      item.addEventListener('click', () => {
        soundManager.playClick();
        container.querySelectorAll('.preset-item').forEach((el) => el.classList.remove('active'));
        item.classList.add('active');
        this.loadPictureMode(preset.url);
      });

      container.appendChild(item);
    });
  }

  initRecordsUI() {
    const container = document.getElementById('records-list');
    if (!container) return;
    container.innerHTML = '';

    const modes = [
      { key: 'best_3', name: '3×3 Grid' },
      { key: 'best_4', name: '4×4 Grid' },
      { key: 'best_5', name: '5×5 Grid' },
      { key: 'best_6', name: '6×6 Grid' },
      { key: 'best_Klotski', name: 'Klotski Blocks' }
    ];

    modes.forEach((m) => {
      const val = localStorage.getItem(m.key);
      const row = document.createElement('div');
      row.className = 'record-row';
      row.innerHTML = `
        <span class="record-grid-name">${m.name}</span>
        <span class="record-val">${val ? `${val}s` : '--'}</span>
      `;
      container.appendChild(row);
    });
  }

  initFactsUI() {
    this.factIndex = 0;
    this.renderFact();

    const prevBtn = document.getElementById('btn-prev-fact');
    const nextBtn = document.getElementById('btn-next-fact');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.factIndex = (this.factIndex - 1 + PUZZLE_FACTS.length) % PUZZLE_FACTS.length;
        this.renderFact();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.factIndex = (this.factIndex + 1) % PUZZLE_FACTS.length;
        this.renderFact();
      });
    }
  }

  renderFact() {
    const fact = PUZZLE_FACTS[this.factIndex];
    const tagEl = document.getElementById('fact-tag');
    const textEl = document.getElementById('fact-text');
    if (tagEl) tagEl.textContent = fact.tag;
    if (textEl) textEl.textContent = fact.text;
  }

  getTodayDateString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getTodaySeed() {
    const dateStr = this.getTodayDateString();
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash << 5) - hash + dateStr.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  loadDailyMode() {
    this.currentMode = 'daily';
    this.updateModeUI('btn-mode-daily');
    document.getElementById('grid-size-controls').style.display = 'flex';
    document.getElementById('btn-auto-solve').style.display = 'inline-flex';
    this.puzzleEngine.setMode('numbers');

    const dateStr = this.getTodayDateString();
    const storageKey = `daily_puzzle_state_${dateStr}`;
    const savedState = localStorage.getItem(storageKey);

    if (savedState) {
      try {
        const stateObj = JSON.parse(savedState);
        this.puzzleEngine.loadState(stateObj);
        this.showToast('Resumed Today\'s Daily Challenge!');
        return;
      } catch (e) {
      }
    }

    const seed = this.getTodaySeed();
    this.puzzleEngine.shuffle(seed);
    this.showToast(`Daily Challenge for ${dateStr} loaded!`);
  }

  onGameStateUpdate(state) {
    const minutes = String(Math.floor(state.seconds / 60)).padStart(2, '0');
    const secs = String(state.seconds % 60).padStart(2, '0');
    const timeEl = document.getElementById('stat-time');
    const movesEl = document.getElementById('stat-moves');
    const bestEl = document.getElementById('stat-best');

    if (timeEl) timeEl.textContent = `${minutes}:${secs}`;
    if (movesEl) movesEl.textContent = state.moves;
    const key = `best_${state.size}`;
    const bestRecord = localStorage.getItem(key);
    if (bestEl) bestEl.textContent = bestRecord ? `${bestRecord}s` : '--';
    if (this.currentMode === 'daily' && state.board) {
      const dateStr = this.getTodayDateString();
      localStorage.setItem(`daily_puzzle_state_${dateStr}`, JSON.stringify({
        board: state.board,
        moves: state.moves,
        seconds: state.seconds,
        isSolved: state.isSolved,
        size: state.size
      }));
    }
    if (state.isSolved) {
      this.handleVictory(state);
    }
  }

  updatePresetVisibility() {
    const presetCard = document.getElementById('preset-card');
    if (presetCard) {
      presetCard.style.display = this.currentMode === 'picture' ? 'flex' : 'none';
    }
  }

  updateModeUI(activeBtnId) {
    [
      'btn-mode-numbers',
      'btn-mode-alphabet',
      'btn-mode-roman',
      'btn-mode-greek',
      'btn-mode-symbols',
      'btn-mode-daily',
      'btn-mode-picture',
      'btn-mode-klotski'
    ].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) {
        if (id === activeBtnId) btn.classList.add('active');
        else btn.classList.remove('active');
      }
    });

    this.updatePresetVisibility();
  }

  initEventListeners() {
    const modesConfig = [
      { id: 'btn-mode-numbers', mode: 'numbers' },
      { id: 'btn-mode-alphabet', mode: 'alphabet' },
      { id: 'btn-mode-roman', mode: 'roman' },
      { id: 'btn-mode-greek', mode: 'greek' },
      { id: 'btn-mode-symbols', mode: 'symbols' }
    ];

    modesConfig.forEach(({ id, mode }) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('click', () => {
          soundManager.playClick();
          this.currentMode = mode;
          this.updateModeUI(id);
          document.getElementById('grid-size-controls').style.display = 'flex';
          document.getElementById('btn-auto-solve').style.display = 'inline-flex';
          this.puzzleEngine.setMode(mode);
          this.puzzleEngine.clearImageTiles();
          this.puzzleEngine.shuffle();
        });
      }
    });

    const dailyBtn = document.getElementById('btn-mode-daily');
    if (dailyBtn) {
      dailyBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.loadDailyMode();
      });
    }

    const picBtn = document.getElementById('btn-mode-picture');
    if (picBtn) {
      picBtn.addEventListener('click', () => {
        soundManager.playClick();
        const presets = ImageCutter.getPresetImages();
        this.loadPictureMode(presets[0].url);
      });
    }

    const klotskiBtn = document.getElementById('btn-mode-klotski');
    if (klotskiBtn) {
      klotskiBtn.addEventListener('click', () => {
        soundManager.playClick();
        this.currentMode = 'klotski';
        this.updateModeUI('btn-mode-klotski');
        document.getElementById('grid-size-controls').style.display = 'none';
        document.getElementById('btn-auto-solve').style.display = 'none';
        this.klotskiEngine.reset();
      });
    }
    const gridBtns = document.querySelectorAll('#grid-size-controls .neu-pill-btn');
    gridBtns.forEach((btn) => {
      btn.addEventListener('click', async () => {
        soundManager.playClick();
        gridBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        this.currentGridSize = parseInt(btn.getAttribute('data-grid'), 10);
        this.puzzleEngine.setSize(this.currentGridSize);

        if (this.currentMode === 'picture' && this.customImageSrc) {
          const sliced = await ImageCutter.sliceImage(this.customImageSrc, this.currentGridSize);
          this.puzzleEngine.setImageTiles(sliced);
        }
        this.puzzleEngine.shuffle();
      });
    });
    const shuffleBtn = document.getElementById('btn-shuffle');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', () => {
        soundManager.playClick();
        if (this.currentMode === 'klotski') this.klotskiEngine.reset();
        else this.puzzleEngine.shuffle();
      });
    }

    const autoSolveBtn = document.getElementById('btn-auto-solve');
    if (autoSolveBtn) {
      autoSolveBtn.addEventListener('click', () => {
        soundManager.playClick();
        if (this.currentMode !== 'klotski') this.puzzleEngine.autoSolve();
      });
    }
    const victoryModal = document.getElementById('victory-modal');
    const modalAgainBtn = document.getElementById('btn-modal-again');
    if (modalAgainBtn) {
      modalAgainBtn.addEventListener('click', () => {
        soundManager.playClick();
        if (victoryModal) victoryModal.classList.remove('open');
        if (this.currentMode === 'klotski') {
          this.klotskiEngine.reset();
        } else {
          this.puzzleEngine.shuffle();
        }
      });
    }

    const modalShareBtn = document.getElementById('btn-modal-share');
    if (modalShareBtn) {
      modalShareBtn.addEventListener('click', () => {
        soundManager.playClick();
        const text = `I just solved the Neumorphic Sliding Puzzle on LastTile! 🧩`;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          this.showToast('Copied victory message to clipboard!');
        }
      });
    }
    const uploadModal = document.getElementById('upload-modal');
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const customUploadBtn = document.getElementById('btn-custom-upload');
    const uploadCancelBtn = document.getElementById('btn-upload-cancel');

    if (customUploadBtn) {
      customUploadBtn.addEventListener('click', () => {
        soundManager.playClick();
        if (uploadModal) uploadModal.classList.add('open');
      });
    }

    if (uploadCancelBtn) {
      uploadCancelBtn.addEventListener('click', () => {
        soundManager.playClick();
        if (uploadModal) uploadModal.classList.remove('open');
      });
    }

    if (dropzone && fileInput) {
      dropzone.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleFileUpload(e.target.files[0]);
        }
      });

      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--accent-primary)';
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });
    }
    const helpModal = document.getElementById('help-modal');
    const helpBtn = document.getElementById('btn-help');
    const helpCloseBtn = document.getElementById('btn-help-close');

    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        soundManager.playClick();
        if (helpModal) helpModal.classList.add('open');
      });
    }
    if (helpCloseBtn) {
      helpCloseBtn.addEventListener('click', () => {
        soundManager.playClick();
        if (helpModal) helpModal.classList.remove('open');
      });
    }
  }

  handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const uploadModal = document.getElementById('upload-modal');
      if (uploadModal) uploadModal.classList.remove('open');
      this.loadPictureMode(e.target.result);
      this.showToast('Custom image loaded successfully!');
    };
    reader.readAsDataURL(file);
  }

  initKeyboardAndTouch() {
    window.addEventListener('keydown', (e) => {
      if (this.currentMode !== 'klotski') {
        this.puzzleEngine.moveByDirection(e.key);
      }
    });
  }

  showToast(msg) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="check-circle" style="color: var(--accent-success)"></i> <span>${msg}</span>`;
    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

# LastTile 

Experience a premium, visually captivating sliding puzzle web application built with a **Heavy Neumorphism (Soft UI)** design system. LastTile features tactile tile animations, 8 distinct puzzle modes, Klotski block puzzles, an advanced AI auto-solver, interactive facts, and synthesized Web Audio sound FX.

## ✨ Features

- **8 Distinct Puzzle Modes**: Numbers (3x3 to 6x6), Alphabet (A..Z), Roman Numerals, Greek Letters, Symbols & Gems, Daily Challenge, Picture Themes, and Klotski Block Mode.
- **Advanced AI Auto-Solver**: A powerful Python backend utilizing A* Search (Manhattan Distance + Linear Conflict) and Layer-by-Layer reduction algorithms to solve even complex 5x5 and 6x6 boards.
- **Picture Puzzles & Slicer**: Play with beautiful procedural theme presets (Cyberpunk, Neon, Abstract, etc.) or drag-and-drop your own custom images directly into the browser to slice them into a puzzle.
- **Master's Journey (Klotski)**: Built-in block sliding engine for rectangular and diverse block logic.
- **Tactile Sound FX**: Custom Web Audio API synthesizer generates soft wooden pops, clicks, and victory fanfare without needing heavy MP3 files.
- **Pure Neumorphic Aesthetics**: Beautiful, clean, modern UI with interactive elements, smooth view transitions, and glowing gradients.

## 🛠️ Architecture

LastTile operates on a lightweight, decoupled full-stack architecture:
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3 built and bundled with **Vite**.
- **Backend API**: Native **Python 3** HTTP Server running the complex AI solver logic.

---

## 🚀 Running Locally

You'll need [Node.js](https://nodejs.org/) and [Python 3](https://python.org/) installed on your machine.

### 1. Start the Python AI Backend
The frontend works without the backend (using a built-in JS fallback solver), but the Python backend provides maximum performance for complex AI solutions.
```bash
# Open a terminal and run the server
python3 server.py
```


### 2. Start the Frontend Vite Server
```bash
# Open a new terminal tab
npm install

# Start the Vite development server
npm run dev
```


---

## 🌍 Deployment

### Deploy the Backend (Python)
1. In Render, create a new **Web Service**.
2. Connect your GitHub repository.
3. Start Command: `python3 server.py`.

### Deploy the Frontend (Vite)
1. In Render, create a new **Static Site**.
2. Connect your GitHub repository.
3. Build Command: `npm run build`.
4. Publish Directory: `dist`.

*(Note: Ensure you update `src/js/puzzleEngine.js` to point the API fetch URL to your new Render Backend URL instead of `localhost:8000` before deploying).*

---


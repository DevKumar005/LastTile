# LastTile — Sliding Puzzles


**A premium sliding puzzle experience** built with **Heavy Neumorphism (Soft UI)**, tactile animations, rich puzzle modes, and a powerful AI auto-solver.

[Play Now →](https://lasttile.onrender.com/)

***

## ✨ Features

- **8 Distinct Puzzle Modes**
  - Numbers (3×3 to 6×6)
  - Alphabet (A–Z)
  - Roman Numerals
  - Greek Letters
  - Symbols & Gems
  - Daily Challenge
  - **Picture Puzzles** (drag & drop your own images)
  - **Klotski Block Mode**
- **Advanced AI Auto-Solver**
  - Python backend using **A* Search** (Manhattan Distance + Linear Conflict)
  - Layer-by-layer reduction algorithm for larger puzzles (5×5 & 6×6)
  - Extremely fast and reliable
- **Immersive Audio**
  - Custom **Web Audio API** synthesizer
  - Realistic wooden clicks, shuffle sounds, and victory fanfares
- **Beautiful Design**
  - Heavy Neumorphic / Soft UI aesthetic
  - Smooth animations and glowing effects
  - Fully responsive (desktop + mobile touch support)

***

## 🛠️ Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3, and **Vite**
- **Backend**: Pure **Python 3** HTTP server (no external dependencies)
- **Solver**: Custom hybrid A* + layer-by-layer algorithm
- **Audio**: Web Audio API

***

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Python 3](https://python.org/)

### 1. Start Python Backend (AI Solver)

```bash
python3 server.py
```

### 2. Start Frontend

```bash
npm install
npm run dev
```

The frontend works without the backend using a built-in JavaScript solver.

***

## 🌍 Deployment

### Backend (Render Web Service)

1. Create a Web Service on Render.
2. Connect this repository.
3. Set the start command to `python3 server.py`.

### Frontend (Static Site)

1. Create a Static Site on Render.
2. Set the build command to `npm run build`.
3. Set the publish directory to `dist`.

**Important:** Update the API URL in `src/js/puzzleEngine.js` to point to your deployed backend.

***

## 📁 Project Structure

```text
LastTile/
├── public/
│   └── images/
├── src/
│   └── js/              # Main game logic
├── index.html
├── server.py            # Python AI Solver API
├── solver.py            # Core solving algorithms
├── package.json
└── vite.config.js
```

***

## 🤝 Contributing

Pull requests are welcome. You can help by:

- Adding new themes
- Improving the solver
- Enhancing UI/UX
- Fixing bugs

***

The last tile awaits.

[Play LastTile](https://lasttile.onrender.com/)
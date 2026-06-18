# AI Chess Coach

An elegant, fully-featured, and **100% offline-ready** Chess application against a computer opponent (Bot) built with Next.js, `chess.js`, and `react-chessboard`. 

The user interface mimics the premium, clean, and smooth experience of Chess.com, featuring modern animations, clear move indicators, a synthesized audio system, and an adjustable local Stockfish engine.

Developed by **Arshad Suraj**.

---

## Key Features

- **100% Offline Local Engine**: Integrates a local client-side Stockfish Web Worker (`public/stockfish.js`) which runs as a browser thread. It has zero network requirements and no external `.wasm` fetch dependency. If the worker stalls, it automatically falls back to an instant local move generator using `chess.js`.
- **Adjustable Difficulty Levels**: Features a custom Elo range slider from Level 1 to 10 matching Stockfish Skill Levels and think depths:
  * **Level 1**: Novice (800 Elo)
  * **Level 5**: Intermediate (1600 Elo)
  * **Level 10**: Grandmaster (2600 Elo)
- **Flexible Color Selection**: Choose to play as **White**, **Black**, or **Random**. Random assignments are programmatically resolved at start, and the bot automatically takes the first turn if assigned White.
- **Move Hints & Last Move Highlights**: 
  * Displays a semi-transparent dot on all legal destination squares.
  * Displays a transparent targeting ring if a legal square contains an opponent's piece.
  * Highlights starting and destination squares of the last move with a soft yellow overlay.
- **Check Animations & Screen Shake**: Flashes the King's square red and triggers a physical container screen-shake using Framer Motion when a King is in check.
- **Real-Time Sound Synthesis**: Implements a native Web Audio API synthesizer (`AudioContext`) to generate high-fidelity, zero-latency sound effects (Move, Capture, Check, Game Over) dynamically without requesting any audio files.
- **Double-Column Move History**: Scrolls and chunks game history into neat move pairs (e.g. `1. e4 e5`) in standard SAN format.
- **Responsive Layout**: Designed with a sleek dark-themed aesthetic (`bg-zinc-950`), fitted to align the board and sidebar at equal heights (`560px`) on desktop, and scaled to prevent browser scrollbars.

---

## Local Setup & Installation

Follow these steps to run the application locally on your machine:

### Prerequisites
Make sure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd AI-Chess-Coach
```

### 2. Install Dependencies
Install the required packages using npm:
```bash
npm install
```

### 3. Run the Development Server
Launch the Next.js local development server:
```bash
npm run dev
```

### 4. Play the Game
Open your web browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## Build for Production
To compile and build the optimized production pages bundle:
```bash
npm run build
npm run start
```

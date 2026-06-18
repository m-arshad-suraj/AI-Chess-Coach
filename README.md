# AI Chess Coach

An elegant, fully-featured, full-stack Chess application against a computer opponent (Bot) built with Next.js, `chess.js`, and `react-chessboard`. 

The user interface mimics the premium, clean, and smooth experience of Chess.com, featuring modern animations, check flashes, a synthesized audio system, and a local Stockfish engine. In addition, it integrates a dedicated **AI Coach Commentary Sidebar** that streams real-time, grandmaster-level chess advice utilizing Stockfish suggestions and the Gemini API.

Developed by **Arshad Suraj**.

---

## Live Deployment
This app is hosted live at: **[https://arshad-ai-chess-coach.netlify.app](https://arshad-ai-chess-coach.netlify.app)**

---

## Key Features

- **Symmetric 3-Column Dashboard**: Left Column (Game Controls/Moves Log) -> Center Column (Chessboard) -> Right Column (AI Chess Coach). All elements are vertically aligned at equal heights (`560px`) on desktop.
- **Dedicated AI Chess Coach**: 
  * Play against the bot and click the **"Get AI Coach Advice"** button during your turn.
  * The coach runs Stockfish in a separate Web Worker thread at Grandmaster level (depth 15/level 10) to find the best move.
  * The current board FEN, the **entire match move history**, and Stockfish's suggested move are sent to a secure Next.js Server Route.
  * The server communicates with the Gemini API (configurable via `GEMINI_MODEL` environment variable) and streams real-time, grandfatherly coach advice word-by-word.
  * The commentary box features dynamic skeleton loader animations during calculations.
  * The advice automatically clears and the button deactivates as soon as you play a move. The button reactivates for the new board state once the opponent bot makes its countermove.
- **100% Offline Local Playing Engine**: Integrates a client-side Stockfish Web Worker (`public/stockfish.js`) which runs as a browser thread. It has zero network requirements and no external `.wasm` fetch dependency. If the worker stalls, it automatically falls back to an instant local move generator using `chess.js`.
- **Adjustable Difficulty Levels**: Features a custom Elo range slider from Level 1 to 10 matching Stockfish Skill Levels and search depths:
  * **Level 1**: Novice (800 Elo)
  * **Level 5**: Intermediate (1600 Elo)
  * **Level 10**: Grandmaster (2600 Elo)
- **Flexible Color Selection**: Play as **White**, **Black**, or **Random**. Random assignments are programmatically resolved at start, and the bot automatically takes the first turn if assigned White.
- **Move Hints & Last Move Highlights**: 
  * Displays a semi-transparent dot on all legal destination squares.
  * Displays a transparent targeting ring if a legal square contains an opponent's piece.
  * Highlights starting and destination squares of the last move with a soft yellow overlay.
- **Check Animations & Screen Shake**: Flashes the King's square red and triggers a physical container screen-shake using Framer Motion when a King is in check.
- **Real-Time Sound Synthesis**: Implements a native Web Audio API synthesizer (`AudioContext`) to generate high-fidelity, zero-latency sound effects (Move, Capture, Check, Game Over) dynamically without requesting any audio files.
- **Double-Column Move History**: Scrolls and chunks game history into neat move pairs (e.g. `1. e4 e5`) in standard SAN format.

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
```bash
npm install
```

### 3. Configure Environment Variables
To enable the AI Coach, you must configure the Gemini API Key and model variables.

#### Option A: Create a `.env.local` file (Recommended)
Create a file named `.env.local` in the root directory of the project and add the keys:
```env
AI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite
```

* **`AI_API_KEY`**: Your Gemini API Key from Google AI Studio.
* **`GEMINI_MODEL`**: The Gemini model name to use for analysis (e.g., `gemini-3.1-flash-lite`).

#### Option B: Export in Terminal (Temporary)
* **Windows Command Prompt (cmd):**
  ```cmd
  set AI_API_KEY=your_gemini_api_key_here
  set GEMINI_MODEL=gemini-3.1-flash-lite
  ```
* **Windows PowerShell:**
  ```powershell
  $env:AI_API_KEY="your_gemini_api_key_here"
  $env:GEMINI_MODEL="gemini-3.1-flash-lite"
  ```
* **Linux / macOS:**
  ```bash
  export AI_API_KEY="your_gemini_api_key_here"
  export GEMINI_MODEL="gemini-3.1-flash-lite"
  ```

### 4. Run the Development Server
Launch the Next.js local development server:
```bash
npm run dev
```

### 5. Play the Game
Open your web browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## Build for Production
To compile and build the optimized production pages bundle:
```bash
npm run build
npm run start
```
*(Make sure `AI_API_KEY` and `GEMINI_MODEL` are configured on the server environment hosting the build/start server).*

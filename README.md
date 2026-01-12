# Football Simulation Telemetry Dashboard

### 🛡️ Standing on the Shoulders of Giants

**This project is a modern, high-performance visualization layer and dashboard built on top of [GallagherAiden/footballSimulationEngine](https://github.com/GallagherAiden/footballSimulationEngine).** Without Aiden Gallagher's comprehensive simulation logic, this telemetry-driven experience would not be possible.

---

### 🚀 TL;DR / Quick Start

**For Users that CBB & AI Agents:**

- **What:** A real-time 2D football visualization and monitoring dashboard.
- **Tech Stack:** React 19, Phaser (Visualization), Zustand (State), FlexLayout (Dashboard), React-Virtuoso (Logs).
- **Core Loop:** A Web Worker runs the simulation engine (Aiden's lib) -> pushes match state to Phaser -> pipes diagnostic logs to a virtualized terminal.
- **Key Features:** Multi-threaded execution, sliding-window log buffer (100 lines), real-time kit weight adjustment, and HMR sync monitoring.
- **Setup:** `npm install` -> `npm run dev` -> Access at `localhost:8080`.

---

### 🧠 The Simulator: Core Engine Deep Dive

The simulation logic is handled by the `footballSimulationEngine`. It is a deterministic, iterative engine that treats a football match as a series of discrete state changes.

#### How it Works:

1. **Initiation:** Takes two team JSONs (11 players each with skills like `passing`, `tackling`, `jumping`) and pitch dimensions. It returns an initial `MatchDetails` object.
2. **Play Iteration:** The engine processes one "tick." It calculates player movement based on their `intentPOS`, handles ball possession logic, and generates a string-based `iterationLog` (e.g., "Player X tackled Player Y").
3. **Ball Over Iterations:** Unlike simple engines, this tracks ball movement over time, allowing for realistic physics like deflections and momentum-based travel.

#### Potential for Further Development:

- **Advanced Tactics:** Integrating "Managerial Intent" where teams shift formations (e.g., 4-4-2 to 3-5-2) dynamically based on match score.
- **Player Fatigue Curves:** Linking player `fitness` stats more aggressively to their success rates in the second half.
- **Environment Variables:** Adding pitch conditions (wet/dry) that modify ball friction and player slip chance.

---

### 🖥️ The App: Telemetry & Visualization

This application transforms the raw JSON output of the engine into a professional-grade telemetry dashboard.

#### Key Architectural Components:

- **Web Worker Threading:** To prevent UI stuttering, the heavy simulation iterations run in a background worker (`simulation.worker.ts`). This ensures the Phaser 60fps rendering and React UI remain buttery smooth.
- **Virtualized Terminal:** Using `react-virtuoso`, the app renders thousands of log lines without memory bloat. It features a rolling index that tracks the global iteration count even as the buffer is capped at 100 lines for performance.
- **Zustand State Bridge:** A central store (`useSimulationStore`) acts as the gatekeeper. It features a "Dump Toggle" that, when disabled, cuts the data pipe at the source to save CPU cycles.
- **Dynamic UI:** Powered by `flexlayout-react`, allowing users to resize the pitch view, telemetry logs, and control panels to fit their monitor.

#### Potential for Further Development:

- **Tweakpane Integration:** Real-time sliders to adjust player skills or kit colors while the match is running.
- **Heatmaps:** A secondary canvas layer in Phaser to track player density and "danger zones" over 90 minutes.
- **Match Replay:** Exporting the match state sequence as a JSON blob to re-run specific telemetry events for debugging.

---

### 🛠️ Technical Setup

#### Requirements:

- Node.js (v18+)
- NPM or Yarn

#### Project Setup:

```bash
# Clone the repository
git clone https://github.com/eozgit/footballsim-demo.git

# Install dependencies
npm install

# Start the development server
npm run dev

```

#### Development Workflow & Scripts:

- `npm run dev`: Starts Vite with HMR and the custom development logger.
- `npm run build`: Compiles the project for production, optimizing the Phaser assets and React tree.
- **HMR Monitoring:** The "Command Deck" displays `LAST_HMR_SYNC`. If you save a file and this timestamp updates, your changes are live.

---

### 🤝 Contributing

1. **Feature Requests:** Open an issue regarding new telemetry metrics (e.g., xG tracking).
2. **Bug Reports:** Please include the `SESSION_START` timestamp from your dashboard for easier debugging.
3. **Core Logic:** If you wish to change how players move or tackle, please contribute directly to the [upstream library](https://github.com/GallagherAiden/footballSimulationEngine).

---

_This project is MIT Licensed. Visual assets are powered by Phaser Studio._

Check out this [Football Simulation Engine Demo](https://www.youtube.com/watch?v=yxTXFrAZCdY) for a walkthrough of the core library's capabilities. This video provides a direct look at the engine's iteration logic and how match details are structured before being visualized in this dashboard.

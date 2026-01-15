This guide serves as the architectural manifesto for the `footballsim-demo` project. It documents the "Guardrail Architecture" designed to maintain a clean separation between high-frequency physics, visual rendering, and UI state.

---

### 1. The Core Architectural Philosophy: The Three Pillars

We follow a strict **Unidirectional Data Flow** across three isolated environments. Modularity is driven by the need to prevent "Leakage"—ensuring that a change in the physics engine doesn't break the React UI, and vice versa.

1. **The Engine (Sim):** Headless, logic-only, running in a Web Worker.
2. **The Visuals (Phaser):** Purely representational; maps coordinates to sprites.
3. **The Dashboard (React):** Telemetry, controls, and high-level state.

---

### 2. Directory Structure & Logic

| Directory            | Logic / Responsibility             | Rationale                                                                                        |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| `src/core/`          | Pure logic, math, and projections. | **Framework Agnostic.** Should never import from Phaser or React. Can be tested in pure Node.js. |
| `src/game/`          | Phaser-specific implementation.    | Contains the "Visual Layer." Owns scenes, sprites, and entity management.                        |
| `src/game/services/` | Scene-agnostic game logic.         | Prevents "God Scenes." Logic like color resolution (`TeamProvider`) belongs here.                |
| `src/bridge/`        | The "Glue" layer.                  | **The Mediator.** Decouples the Simulation Worker from the React/Zustand UI.                     |
| `src/components/`    | React UI Components.               | Only handles DOM rendering. Never touches Phaser directly.                                       |

---

### 3. Key Patterns & Modularization Rationale

#### A. The Entity Manager Pattern (`FieldEntityManager.ts`)

**What:** Instead of `MatchScene` managing 22 player sprites and a ball, it delegates to this manager.
**Why:** Phaser Scenes should handle lifecycle (create/update/destroy). Managing a `Map` of player IDs and batch-updating their positions is a "System" responsibility. This makes the code resilient to HMR (Hot Module Replacement) and easier to unit test.

#### B. The Mediator/Bridge Pattern (`SimulationBridge.ts`)

**What:** A static class that listens to the Worker and updates the Zustand store.
**Why:** It creates a **Defensive Layer**. The engine might send incomplete data (e.g., during initialization). The Bridge validates and "cleans" this data before it touches the UI, preventing the React tree from crashing due to `undefined` properties.

#### C. Guard Clauses & Optional Chaining

**Convention:** All data entering from the Worker _must_ be treated as potentially malformed.
**Rationale:** In multi-threaded environments, race conditions are common. Using `typeof x === 'number'` and optional chaining `state.stats?.goals` is a project-wide requirement for stability.

---

### 4. The Strategic Role of Tests

In this project, tests are not just for verification; they are **Architectural Enforcement Tools**.

- **Boundary Enforcement:** Tests for `core/physics` ensure that math remains pure and unaffected by UI changes.
- **Regression Guarding:** The `SimulationBridge.test.ts` specifically tests "Partial State Updates." This ensures that if the engine changes its output format, the UI remains crash-proof.
- **Behavioral Mapping:** By using the JSON reporter in `generate-context.js`, the tests act as **Live Documentation**. The AI and future developers can see exactly what behaviors are "contractually guaranteed" (e.g., "should cap logs at 100 entries").

---

### 5. Interaction Map (How it fits together)

1. **Trigger:** `App.tsx` renders `PhaserGame.tsx`.
2. **Simulation Start:** `MatchScene.ts` spawns `MatchManager.ts`, which starts the `simulation.worker.ts`.
3. **The Loop:** \* Worker sends `STATE_UPDATED`.

- `MatchManager` catches it.
- **Path A (Visuals):** `FieldEntityManager` receives state and tweens sprites.
- **Path B (UI):** `SimulationBridge` receives state, validates it, and updates `useSimulationStore`.

4. **Reaction:** React components (Scoreboard, Logs) re-render automatically based on store changes.

---

### 6. Missing Aspects to Watch (Future Debt)

- **Asset Decoupling:** Currently, `MatchScene` preloads specific team JSONs. Future work should move asset loading to a `Registry` service so teams can be loaded dynamically without modifying scene code.
- **Worker Error Recovery:** If the Worker crashes, the UI currently stays silent. A `SimulationHealthMonitor` should be added to the Bridge to notify the user if the "heartbeat" from the worker stops.
- **Event Serialization:** As we add interactivity (e.g., clicking a player to see stats), we need a strict `Action` pattern for sending messages _back_ to the worker to avoid chaotic state management.

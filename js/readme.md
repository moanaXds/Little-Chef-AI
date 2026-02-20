├── js/                    # Core game logic & engine
------------------------------
│   ├── main.js            # Game loop, state management, initialization
│   ├── engine.js          # Rendering engine, animation loop, canvas management
│   ├── kitchen.js         # Station logic: Cutting Board, Stove, Mixer, Plating
│   ├── player.js          # Input handling: drag-drop, clicks, interactions
│   ├── hud.js             # UI rendering: recipe card, timer, score, buttons
│   ├── aiChef.js          # Main AI controller: behavior, hints, reactions
│   ├── recipe.js          # Recipe definitions, steps, validation logic
│   ├── qLearning.js       # RL algorithm: Q-table, rewards, learning updates
│   ├── utils.js           # Utilities: audio synthesis, particles, helpers
│   └── agents/            # Modular AI sub-agents
-------------------
│       ├── creativityAgent.js   # Recipe adaptation & creative suggestions
│       ├── ingredientAgent.js   # Ingredient tracking & recommendations
│       ├── strategyAgent.js     # Long-term cooking strategy planning
│       └── timingAgent.js       # Time management & urgency detection
----------------------

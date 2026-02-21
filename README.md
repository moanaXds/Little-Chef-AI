# Little Chef AI - Cooking Simulator Demo

This is a browser-based cooking game with an AI agent that learns and plays with you!

## Overview

Little Chef AI is an interactive cooking game where players compete against time to prepare recipes while an AI chef observes, learns, and provides intelligent feedback. Built with vanilla JavaScript and modern Web APIs.

<img width="1492" height="901" alt="1" src="https://github.com/user-attachments/assets/57e85ee7-7704-48ac-8938-5a7b8d8b9492" />
<img width="1460" height="897" alt="2" src="https://github.com/user-attachments/assets/12c871cd-5636-46bb-93f6-f0286912ea69" />
<img width="1617" height="867" alt="3" src="https://github.com/user-attachments/assets/4692a906-fd0b-44ef-b550-fbe52aab0481" />

## 📂 Project Structure
- `index.html` - Main entry point.
- `css/` - Styling and layout.
- `js/` - Game logic, engine, and AI agents.
- `run_server.ps1` - Simple local server script.

## 🚀 How to Run

Because this game uses modern JavaScript modules (`import/export`), you **cannot** run it by just double-clicking `index.html`. You need a local server.

### Option 1: PowerShell Script (Windows)
1. Right-click `run_server.ps1` and select "Run with PowerShell".
2. OR open a terminal in this folder and run: `.\run_server.ps1`
3. Open your browser to: `http://localhost:8000`

### Option 2: Python
If you have Python installed, you can run:
```bash
python -m http.server 8000
```
Then open `http://localhost:8000`.

### Option 3: VS Code Live Server
If you use VS Code, install the "Live Server" extension, right-click `index.html`, and choose "Open with Live Server".

## 🎮 Controls
- **Mouse**: Click stations to interact, drag ingredients from the shelf.
- **Top-Left Button**: Exit/Reset the game.
- **Right Panel**: View recipes and current progress.

## 📜 Features
- **AI Chef**: Suggests actions and reacts to your gameplay.
- **Interactive Kitchen**: Animated stove fire, chopping, and mixing.
- **Progression**: Tracks high scores and streaks.

Enjoy cooking! 👨‍🍳


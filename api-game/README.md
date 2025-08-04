# Pokémon Trading Card Game (TCG) – Web Battle App

A real-time, two-player online Pokémon TCG battle simulator. Built with Next.js, Socket.io, and a Python backend for match logging. Supports full game logic including Pokémon selection, damage resolution, knockout handling, winner detection, and rematch functionality.

---

## 🎮 Features

- 🔌 Real-time multiplayer battles via WebSockets
- ⚔️ Turn-based attack mechanics with visual HP loss
- 🛡️ Knockout (KO) logic with return-to-hand animations
- 🎉 Winner modal with confetti effects and play-again support
- 🧠 Smart card interaction rules (e.g., disable hand after attacking)
- 📦 Match state management with React hooks + socket.io

---

## 🧱 Tech Stack

### Frontend
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Framer Motion** – card animations
- **canvas-confetti** – celebration effects
- **Socket.io Client** – real-time sync

### Backend
- **Socket.io Server (Node.js)** – handles game state & events

---

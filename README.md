# Rampart

An archer defends the castle wall against waves of siegers. A browser arcade game built with Phaser 3, Vite and TypeScript.

**Play:** https://jjbramble.github.io/rampart/

## Controls
Aim with the mouse or your finger. Hold to draw the bow, then release to fire. Arrows arc under gravity, so lead your targets.

## Development
```
npm install
npm run dev      # http://localhost:5173/rampart/
npm test         # unit tests (Vitest)
npm run build    # type-check + production build
```
Every push to `main` publishes the game to GitHub Pages. Gameplay tuning lives in `src/config.ts`.

# Rampart

An archer defends the castle wall against waves of siegers. A browser arcade game built with Phaser 3, Vite and TypeScript.

**Play:** https://jjbramble.github.io/rampart/

## Controls
Aim with the mouse or your finger. Hold to draw the bow, then release to fire. Arrows arc under gravity, so lead your targets.

## The siege
Siegers attack in waves. Clear a wave for a bonus (more if the gate took no damage), then catch your breath while the quiver refills.
- **Troops** (wave 1+) march on the gate.
- **Kite-riders** (wave 2+) bob across the sky and dive onto the battlement.
- **Shieldbearers** (wave 3+) deflect flat shots. Lob arrows so they plunge down onto them.
- **Battering rams** (wave 4+) soak up arrows and hit the gate for 3.

Missed or deflected arrows break your combo.

## Upgrades
After each wave, pick one of three upgrades (click a card or press 1–3). They last for the rest of the run:
Deep Quiver (more arrows), Quick Hands (faster reload), Strong Arm (faster draw), Bodkin Tips (arrows pierce),
Volley (extra arrows per shot), Fortify (more gate HP) and Mason (repair the gate, always offered when it's at half or below).

Your best score and furthest wave are saved in the browser and shown on the title screen.

## Development
```
npm install
npm run dev      # http://localhost:5173/rampart/
npm test         # unit tests (Vitest)
npm run build    # type-check + production build
```
Every push to `main` publishes the game to GitHub Pages. Gameplay tuning lives in `src/config.ts`; the wave difficulty curve is in `src/systems/waves.ts` and upgrade rules in `src/systems/upgrades.ts`.

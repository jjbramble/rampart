// Pure maths for the bow, shared by the trajectory preview and the real arrow.
import { BOW } from '../config';

export interface Vec { x: number; y: number }

/** Draw power 0..1 from how long the bow has been held. */
export function drawPower(heldMs: number): number {
  return Math.max(0, Math.min(1, heldMs / BOW.fullDrawMs));
}

/** Launch velocity aiming from `from` toward `to` at the given power. */
export function launchVelocity(from: Vec, to: Vec, power: number): Vec {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const speed = BOW.minSpeed + (BOW.maxSpeed - BOW.minSpeed) * power;
  return { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed };
}

/** Position after t seconds of projectile motion. */
export function positionAt(start: Vec, v: Vec, t: number, gravity = BOW.gravity): Vec {
  return { x: start.x + v.x * t, y: start.y + v.y * t + 0.5 * gravity * t * t };
}

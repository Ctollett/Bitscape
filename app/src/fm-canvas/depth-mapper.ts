import type { FMCanvasPatch } from './types';
import { DEPTH_DECAY_CONSTANT } from './constants';


/** Euclidean distance between two points. */
function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/**
 * Maps pixel distance to mod depth (0-127).
 * Exponential decay: closer = more modulation.
 *   depth = 127 * e^(-dist / DECAY_CONSTANT)
 *
 * At ~200px apart → depth ≈ 47
 * At ~400px apart → depth ≈ 17
 * Touching (0px)  → depth = 127
 */
function distanceToDepth(distancePx: number): number {
  const normalized = Math.exp(-distancePx / DEPTH_DECAY_CONSTANT);
  return Math.round(normalized * 127);
}

/**
 * Compute mod_depth_a and mod_depth_b from the current patch state.
 *
 * Uses the actual user-drawn connections (excluding self-loops).
 * Groups by SOURCE operator:
 *   - Sources 0 or 1 → mod_depth_a
 *   - Sources 2 or 3 → mod_depth_b
 *
 * Averages distances within each group.
 */
export function computeModDepths(patch: FMCanvasPatch): {
  modDepthA: number;
  modDepthB: number;
} {
  const activeNonSelf = patch.connections.filter(c => c.src !== c.dst);

  if (activeNonSelf.length === 0) return { modDepthA: 0, modDepthB: 0 };

  let sumA = 0, countA = 0;
  let sumB = 0, countB = 0;

  for (const { src, dst } of activeNonSelf) {
    const dist = distance(
      patch.operators[src].position,
      patch.operators[dst].position,
    );

    if (src === 0 || src === 1) {
      sumA += dist;
      countA++;
    } else {
      sumB += dist;
      countB++;
    }
  }

  return {
    modDepthA: countA > 0 ? distanceToDepth(sumA / countA) : 0,
    modDepthB: countB > 0 ? distanceToDepth(sumB / countB) : 0,
  };
}

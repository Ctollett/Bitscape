import type { FMCanvasPatch } from './types';
import { DEPTH_DECAY_CONSTANT } from './constants';

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
 * Build a flat 16-element depth matrix (src*4+dst indexing).
 * Each active connection gets its own depth based on spatial proximity.
 * Unconnected pairs are 0. Self-loops (feedback) are always 0 here.
 */
export function computeModDepthMatrix(patch: FMCanvasPatch): number[] {
  const matrix = new Array(16).fill(0);

  for (const { src, dst } of patch.connections) {
    if (src === dst) continue; // feedback handled separately
    const dist = distance(patch.operators[src].position, patch.operators[dst].position);
    matrix[src * 4 + dst] = distanceToDepth(dist);
  }

  return matrix;
}

/**
 * Legacy: compute modDepthA/B from the matrix for backward compatibility.
 * modDepthA = max of any A-group (src 0 or 1) connection depth.
 * modDepthB = max of any B-group (src 2 or 3) connection depth.
 */
export function computeModDepths(patch: FMCanvasPatch): { modDepthA: number; modDepthB: number } {
  const matrix = computeModDepthMatrix(patch);
  let modDepthA = 0;
  let modDepthB = 0;
  for (let src = 0; src < 4; src++) {
    for (let dst = 0; dst < 4; dst++) {
      const d = matrix[src * 4 + dst];
      if (src <= 1) modDepthA = Math.max(modDepthA, d);
      else modDepthB = Math.max(modDepthB, d);
    }
  }
  return { modDepthA, modDepthB };
}

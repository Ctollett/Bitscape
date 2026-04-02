import type { Point } from './types';
import { NODE_RADIUS } from './constants';

export function edgePoint(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return from;
  return {
    x: from.x + (dx / dist) * NODE_RADIUS,
    y: from.y + (dy / dist) * NODE_RADIUS,
  };
}

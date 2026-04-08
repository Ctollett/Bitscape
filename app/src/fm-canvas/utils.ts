import type { Point, Connection, OperatorPatch } from './types';
import { RING_RADIUS } from './constants';

export function getNodeRotation(opIndex: number, operators: OperatorPatch[], connections: Connection[]): number {
  const op = operators[opIndex]
  const angles = connections
    .filter(c => c.src === opIndex || c.dst === opIndex)
    .map(c => {
      const otherIdx = c.src === opIndex ? c.dst : c.src
      const other = operators[otherIdx].position
      return Math.atan2(other.y - op.position.y, other.x - op.position.x)
    })
  if (angles.length === 0) return 0
  return angles.reduce((sum, a) => sum + a, 0) / angles.length
}

export function rotateOffset(offset: Point, angleRad: number): Point {
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  return {
    x: offset.x * cos - offset.y * sin,
    y: offset.x * sin + offset.y * cos,
  }
}

export function edgePoint(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return from;
  return {
    x: from.x + (dx / dist) * RING_RADIUS,
    y: from.y + (dy / dist) * RING_RADIUS,
  };
}

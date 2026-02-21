import type { Point } from './types';
import { NODE_RADIUS } from './constants';

interface ConnectionLineProps {
  src: Point;
  dst: Point;
  srcOp: number;
  dstOp: number;
  color?: string;
  onRemove: () => void;
}

/** Offset a point toward another by NODE_RADIUS so the line starts at the circle edge. */
function edgePoint(from: Point, to: Point): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return from;
  return {
    x: from.x + (dx / dist) * NODE_RADIUS,
    y: from.y + (dy / dist) * NODE_RADIUS,
  };
}

export function ConnectionLine({ src, dst, color, onRemove }: ConnectionLineProps) {
  const srcEdge = edgePoint(src, dst);
  const dstEdge = edgePoint(dst, src);

  return (
    <g>
      <line x1={srcEdge.x} y1={srcEdge.y} x2={dstEdge.x} y2={dstEdge.y}
        stroke={color || '#888'} strokeWidth={2} />
      <line x1={srcEdge.x} y1={srcEdge.y} x2={dstEdge.x} y2={dstEdge.y}
        stroke="transparent" strokeWidth={14}
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }} />
    </g>
  );
}

import { NODE_RADIUS } from './constants';
import type { Point } from './types';

interface DraftConnectionProps {
  from: Point;
  to: Point;
}


export function DraftConnection({ from, to }: DraftConnectionProps) {
  
  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const edgeX = from.x + NODE_RADIUS * 1.3 * Math.cos(angle)
  const edgeY = from.y + NODE_RADIUS * 1.3 * Math.sin(angle)


return (
  <line x1={edgeX} y1={edgeY} x2={to.x} y2={to.y} stroke={'#888'} strokeWidth={2} strokeDasharray="6 4"
  ></line>
)
  
}
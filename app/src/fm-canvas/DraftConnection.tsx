import { NODE_RADIUS } from './constants';
import type { Point } from './types';

interface DraftConnectionProps {
  from: Point;
  to: Point;
  fromEdge?: Point;
  color?: string;
}


export function DraftConnection({ from, to, fromEdge, color }: DraftConnectionProps) {

  const angle = Math.atan2(to.y - from.y, to.x - from.x)
  const edgeX = fromEdge ? fromEdge.x : from.x + NODE_RADIUS * 1.3 * Math.cos(angle)
  const edgeY = fromEdge ? fromEdge.y : from.y + NODE_RADIUS * 1.3 * Math.sin(angle)

  return (
    <>
      <line x1={edgeX} y1={edgeY} x2={to.x} y2={to.y} stroke={'#888'} strokeWidth={2} strokeDasharray="6 4" />
      <circle cx={edgeX} cy={edgeY} r={5} fill={color ?? '#888'} />
    </>
  )

}
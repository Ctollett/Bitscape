import { usePatch } from './patch-context';
import { NODE_RADIUS, SELF_LOOP_MIN_RADIUS, SELF_LOOP_MAX_RADIUS } from './constants';
import type { Point } from './types';

interface SelfLoopArcProps {
  opIndex: number;
  center: Point;
  radius: number;
}

export function SelfLoopArc(_props: SelfLoopArcProps) {

  // TODO: Implement
  // - SVG feedback loop visualization on the operator
  // - Draggable edge to resize (pointer events)
  // - Radius maps to feedback amount (SELF_LOOP_MIN_RADIUS to SELF_LOOP_MAX_RADIUS)
  // - On drag: dispatch({ type: 'SET_SELF_LOOP', opIndex, radius: newRadius })
  // - Visual indication of feedback intensity (thicker/brighter at higher values)
  // - Position loop above the node: loopCenterY = center.y - NODE_RADIUS - radius

  return null;
}

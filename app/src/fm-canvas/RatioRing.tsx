import { usePatch } from './patch-context';
import { NODE_RADIUS, RATIO_SNAPS } from './constants';
import type { Point } from './types';

interface RatioRingProps {
  opIndex: number;
  center: Point;
}

export function RatioRing({ opIndex, center }: RatioRingProps) {
  const { patch, dispatch } = usePatch();
  const op = patch.operators[opIndex];

  // TODO: Implement
  // - SVG ring around the operator node (radius slightly larger than NODE_RADIUS)
  // - Pointer events to compute rotation angle from center
  // - Snap angle to nearest RATIO_SNAPS value (15 positions, ~24° apart)
  // - Dispatch: dispatch({ type: 'SET_RING_ANGLE', opIndex, angle })
  // - Show tick marks at snap positions
  // - Highlight current ratio position
  // - op.ringAngle has the current angle, op.ratio has the current value

  return null;
}

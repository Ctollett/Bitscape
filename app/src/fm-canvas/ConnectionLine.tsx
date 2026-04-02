import type { Point } from './types';
import { useState, useEffect } from 'react';
import {animate} from 'framer-motion'
interface ConnectionLineProps {
  src: Point;
  dst: Point;
  srcOffset: Point;
  dstOffset: Point;
  srcOp: number;
  dstOp: number;
  color?: string;
  onRemove: () => void;
}

export function ConnectionLine({ src, dst, srcOffset, dstOffset, color, onRemove }: ConnectionLineProps) {

  const srcEdge = { x: src.x + srcOffset.x, y: src.y + srcOffset.y }
  const dstEdge = { x: dst.x + dstOffset.x, y: dst.y + dstOffset.y }


  const dx = dstEdge.x - srcEdge.x
  const dy = dstEdge.y - srcEdge.y

  const dist = Math.sqrt(dx * dx + dy * dy)

  const naturalLength = 250

  const slack = Math.max(0, naturalLength - dist)

  let cp1x = srcEdge.x + (dstEdge.x - srcEdge.x) * 0.25
  let cp1y = srcEdge.y + (dstEdge.y - srcEdge.y) * 0.25

  let cp2x = dstEdge.x + (srcEdge.x - dstEdge.x) * 0.25
  let cp2y = dstEdge.y + (srcEdge.y - dstEdge.y) * 0.25

const [multiplier, setMultiplier] = useState(0)

useEffect(() => {
  animate(0, 1, {
    type: 'spring',
    stiffness: 80,
    damping: 12,
    onUpdate: (v) => setMultiplier(v)
  })
}, [])


  cp1y += slack * multiplier * 0.5
  cp2y += slack * multiplier * 0.5


  const tautness = 1 - Math.min(1, slack / naturalLength)
  const glowWidth = 2 + (1 - tautness) * 5
  const glowOpacity = (1 - tautness) * 0.25
  


  return (
    <g>
      <path d={`M ${srcEdge.x} ${srcEdge.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${dstEdge.x} ${dstEdge.y}`}
        fill="none" stroke={color || '#888'} strokeWidth={glowWidth} opacity={glowOpacity} strokeLinecap="round" />
      <path d={`M ${srcEdge.x} ${srcEdge.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${dstEdge.x} ${dstEdge.y}`}
        fill="none" stroke={color || '#888'} strokeWidth={1.5} strokeLinecap="round" />
     <path d={`M ${srcEdge.x} ${srcEdge.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${dstEdge.x} ${dstEdge.y}`}
        fill="none" stroke={'transparent'} strokeWidth={14} strokeLinecap="round"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }} />
    </g>
  );
}

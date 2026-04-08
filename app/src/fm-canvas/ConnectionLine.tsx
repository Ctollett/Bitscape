import type { Point } from './types';
import { useState, useEffect } from 'react';
import {animate} from 'framer-motion'
import { edgePoint } from './utils';

interface ConnectionLineProps {
  src: Point;
  dst: Point;
  srcOffset: Point;
  dstOffset: Point;
  srcOp: number;
  dstOp: number;
  color?: string;
  srcColor: string;
  dstColor: string;
  onRemove: () => void;
}

export function ConnectionLine({ src, dst, color, srcColor, dstColor, onRemove }: ConnectionLineProps) {

  const srcEdge = edgePoint(src, dst)
  const dstEdge = edgePoint(dst, src)


  const dx = dstEdge.x - srcEdge.x
  const dy = dstEdge.y - srcEdge.y

  const dist = Math.sqrt(dx * dx + dy * dy)

  const srcDot = { x: srcEdge.x + (dx / dist) * 5, y: srcEdge.y + (dy / dist) * 5 }
  const dstDot = { x: dstEdge.x + (dx / dist) * -5, y: dstEdge.y + (dy / dist) * -5 }

  const naturalLength = 350

  const slack = Math.max(0, naturalLength - dist)

  let cp1x = srcDot.x + (dstDot.x - srcDot.x) * 0.25
  let cp1y = srcDot.y + (dstDot.y - srcDot.y) * 0.25

  let cp2x = dstDot.x + (srcDot.x - dstDot.x) * 0.25
  let cp2y = dstDot.y + (srcDot.y - dstDot.y) * 0.25

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
      <path d={`M ${srcDot.x} ${srcDot.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${dstDot.x} ${dstDot.y}`}
        fill="none" stroke={color || '#888'} strokeWidth={glowWidth} opacity={glowOpacity} strokeLinecap="round" />
      <path d={`M ${srcDot.x} ${srcDot.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${dstDot.x} ${dstDot.y}`}
        fill="none" stroke={color || '#888'} strokeWidth={1.5} strokeLinecap="round" />
      <path d={`M ${srcDot.x} ${srcDot.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${dstDot.x} ${dstDot.y}`}
        fill="none" stroke={'transparent'} strokeWidth={14} strokeLinecap="round"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }} />
      <circle cx={srcDot.x} cy={srcDot.y} r={5} fill={srcColor} />
      <circle cx={dstDot.x} cy={dstDot.y} r={5} fill="var(--color-canvas-bg, #0a0a0a)" stroke={dstColor} strokeWidth={1.5} />
    </g>
  );
}

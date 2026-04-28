import type { Point } from './types';
import { useState, useEffect, useRef } from 'react';
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
  lateralOffset?: number;
  onRemove: () => void;
  getSrcPullStrength?: () => number;
  getDstPullStrength?: () => number;
}

const NATURAL_LENGTH = 350

function computePathData(src: Point, dst: Point, srcPull: number, dstPull: number, multiplier: number, lateralOffset = 0) {
  const dx = dst.x - src.x
  const dy = dst.y - src.y
  const nodeDist = Math.sqrt(dx * dx + dy * dy)
  if (nodeDist === 0) return { pathD: '', srcDot: src, dstDot: dst, glowWidth: 2, glowOpacity: 0 }

  const nx = dx / nodeDist
  const ny = dy / nodeDist
  // Perpendicular direction (90° left of travel)
  const px = -ny
  const py = nx

  const srcEdge = edgePoint(src, dst)
  const dstEdge = edgePoint(dst, src)

  const srcDot = { x: srcEdge.x + nx * (5 + srcPull) + px * lateralOffset, y: srcEdge.y + ny * (5 + srcPull) + py * lateralOffset }
  const dstDot = { x: dstEdge.x - nx * (5 + dstPull) + px * lateralOffset, y: dstEdge.y - ny * (5 + dstPull) + py * lateralOffset }

  const ldx = dstDot.x - srcDot.x
  const ldy = dstDot.y - srcDot.y
  const lineDist = Math.sqrt(ldx * ldx + ldy * ldy)
  const slack = Math.max(0, NATURAL_LENGTH - lineDist)

  let cp1x = srcDot.x + ldx * 0.25
  let cp1y = srcDot.y + ldy * 0.25
  let cp2x = dstDot.x - ldx * 0.25
  let cp2y = dstDot.y - ldy * 0.25

  cp1y += slack * multiplier * 0.5
  cp2y += slack * multiplier * 0.5

  const tautness = 1 - Math.min(1, slack / NATURAL_LENGTH)
  const glowWidth = 2 + (1 - tautness) * 5
  const glowOpacity = (1 - tautness) * 0.25

  const pathD = `M ${srcDot.x} ${srcDot.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${dstDot.x} ${dstDot.y}`
  return { pathD, srcDot, dstDot, glowWidth, glowOpacity }
}

export function ConnectionLine({ src, dst, color, srcColor, dstColor, lateralOffset = 0, onRemove, getSrcPullStrength, getDstPullStrength }: ConnectionLineProps) {
  const [multiplier, setMultiplier] = useState(0)
  const multiplierRef = useRef(0)
  const srcRef = useRef(src)
  const dstRef = useRef(dst)
  srcRef.current = src
  dstRef.current = dst

  const glowPathRef = useRef<SVGPathElement>(null)
  const linePathRef = useRef<SVGPathElement>(null)
  const hitPathRef = useRef<SVGPathElement>(null)
  const srcCircleRef = useRef<SVGCircleElement>(null)
  const dstCircleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    animate(0, 1, {
      type: 'spring',
      stiffness: 80,
      damping: 12,
      onUpdate: (v) => { setMultiplier(v); multiplierRef.current = v }
    })
  }, [])

  useEffect(() => {
    let raf: number
    const tick = () => {
      const srcPull = getSrcPullStrength?.() ?? 0
      const dstPull = getDstPullStrength?.() ?? 0
      if (srcPull > 0 || dstPull > 0) {
        const { pathD, srcDot, dstDot, glowWidth, glowOpacity } = computePathData(
          srcRef.current, dstRef.current, srcPull, dstPull, multiplierRef.current, lateralOffset
        )
        glowPathRef.current?.setAttribute('d', pathD)
        glowPathRef.current?.setAttribute('stroke-width', String(glowWidth))
        glowPathRef.current?.setAttribute('opacity', String(glowOpacity))
        linePathRef.current?.setAttribute('d', pathD)
        hitPathRef.current?.setAttribute('d', pathD)
        if (srcCircleRef.current) { srcCircleRef.current.setAttribute('cx', String(srcDot.x)); srcCircleRef.current.setAttribute('cy', String(srcDot.y)) }
        if (dstCircleRef.current) { dstCircleRef.current.setAttribute('cx', String(dstDot.x)); dstCircleRef.current.setAttribute('cy', String(dstDot.y)) }
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [getSrcPullStrength, getDstPullStrength])

  const { pathD, srcDot, dstDot, glowWidth, glowOpacity } = computePathData(src, dst, 0, 0, multiplier, lateralOffset)

  return (
    <g>
      <path ref={glowPathRef} d={pathD} fill="none" stroke={color || '#888'} strokeWidth={glowWidth} opacity={glowOpacity} strokeLinecap="round" />
      <path ref={linePathRef} d={pathD} fill="none" stroke={color || '#888'} strokeWidth={1.5} strokeLinecap="round" />
      <path ref={hitPathRef} d={pathD} fill="none" stroke={'transparent'} strokeWidth={14} strokeLinecap="round"
        style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }} />
      <circle ref={srcCircleRef} cx={srcDot.x} cy={srcDot.y} r={5} fill={srcColor} />
      <circle ref={dstCircleRef} cx={dstDot.x} cy={dstDot.y} r={5} fill="var(--color-canvas-bg, #0a0a0a)" stroke={dstColor} strokeWidth={1.5} />
    </g>
  );
}

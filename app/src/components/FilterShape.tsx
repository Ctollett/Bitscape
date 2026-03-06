import { colors } from '../tokens'
import { useRef } from 'react'


export type FilterType = 'lp' | 'hp' | 'bp';

interface FilterShapeProps {
  type: FilterType;
  cutoff: number;
  resonance: number;
  onCutOffChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
}

const W = 340      // SVG width
const H = 160      // SVG height
const MID_Y = H * 0.38   // passband level (~61px from top)
const BOT_Y = H * 0.90   // stopband level (~144px from top)
const BW = 32      // resonance bump half-width in pixels
const PAD = 20     // horizontal padding so the curve doesn't touch the edges


function buildPath(type: FilterType, cutoff: number, resonance: number): string {
const leftY  = type === 'lp' ? MID_Y : BOT_Y
const rightY = type === 'hp' ? MID_Y : BOT_Y
const peakY  = MID_Y - resonance * (MID_Y - H * 0.05)
const cx     = PAD + cutoff * (W - PAD * 2)

return [
    `M 0,${leftY}`,
    `C ${cx * 0.4},${leftY} ${cx - BW * 2},${leftY} ${cx - BW},${leftY}`,
    `C ${cx - BW * 0.4},${leftY} ${cx},${peakY} ${cx},${peakY}`,
    `C ${cx},${peakY} ${cx + BW * 0.4},${rightY} ${cx + BW},${rightY}`,
    `C ${cx + BW * 2},${rightY} ${W - (W - cx) * 0.4},${rightY} ${W},${rightY}`,
  ].join(' ')
}

export function FilterShape({ type, cutoff, resonance, onCutOffChange, onResonanceChange }: FilterShapeProps) {
const pathD = buildPath(type, cutoff, resonance)
const cx    = PAD + cutoff * (W - PAD * 2)
const peakY = MID_Y - resonance * (MID_Y - H * 0.05)

const isDragging = useRef(false)
const lastX = useRef(0)
const lastY = useRef(0)


const onPointerDown = (e: React.PointerEvent) => {
  e.preventDefault();
  isDragging.current = true
  lastX.current = e.clientX
  lastY.current = e.clientY
  e.currentTarget.setPointerCapture(e.pointerId)
  
}

const onPointerMove = (e: React.PointerEvent) => {
  if(!isDragging.current) return 
  const deltaX = e.clientX - lastX.current
  const newCutoff = Math.max(0, Math.min(1, cutoff + deltaX / W))
  const deltaY = e.clientY - lastY.current

  lastX.current = e.clientX
  lastY.current = e.clientY

  const newResonance = Math.max(0, Math.min(1, resonance - deltaY / H))

  onCutOffChange(newCutoff)
  onResonanceChange(newResonance)

  
}

const onPointerUp = () => {
  isDragging.current = false;
  
}



  return (
    <svg width={340} height={160} style={{ display: 'block', pointerEvents: 'none' }}>
      <path d={pathD} fill="none" stroke={colors.bg.canvas} strokeWidth={2.5} strokeLinecap="round" style={{ ['d' as string]: `path("${pathD}")`, transition: 'd 0.45s ease' } as React.CSSProperties}></path>
      <g onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ transform: `translate(${cx}px, ${peakY}px)`, cursor: 'grab', pointerEvents: 'auto' }}>
      <circle r={6} fill={colors.bg.panel} stroke={colors.control.indicator} strokeWidth={2} />
      </g>
    </svg>
  );
}

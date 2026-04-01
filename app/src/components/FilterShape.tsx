import { colors, typography } from '../tokens'
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

export type FilterType = 'lp' | 'hp' | 'bp';

interface FilterShapeProps {
  type: FilterType;
  cutoff: number;      // 0–1
  resonance: number;   // 0–1
  onCutOffChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
}

const W = 280
const H = 160
const PAD_L = 8
const PAD_R = 8
const PAD_T = 12
const PAD_B = 28   // room for frequency labels

const PLOT_W = W - PAD_L - PAD_R
const PLOT_H = H - PAD_T - PAD_B

// Logarithmic frequency scale: 20 Hz – 20 kHz
const F_MIN = 20
const F_MAX = 20000

function freqToX(freq: number): number {
  return PAD_L + (Math.log10(freq / F_MIN) / Math.log10(F_MAX / F_MIN)) * PLOT_W
}

function cutoffToX(cutoff: number): number {
  // cutoff 0–1 maps to F_MIN–F_MAX on log scale
  const freq = F_MIN * Math.pow(F_MAX / F_MIN, cutoff)
  return freqToX(freq)
}

function xToCutoff(x: number): number {
  const t = (x - PAD_L) / PLOT_W
  return Math.max(0, Math.min(1, t))
}

const PASSBAND_Y = PAD_T + PLOT_H * 0.45   // mid-height
const STOPBAND_Y = H + 20                  // below the SVG — goes out of view

function buildPath(type: FilterType, cutoff: number, resonance: number): string {
  const cx      = cutoffToX(cutoff)
  const peakY   = PASSBAND_Y - resonance * PLOT_H * 0.45
  const leftY   = type === 'lp' ? PASSBAND_Y : STOPBAND_Y
  const rightY  = type === 'hp' ? PASSBAND_Y : STOPBAND_Y
  // How wide the resonance bump and rolloff shoulder are
  const shoulder = 28
  const rolloff  = 36

  if (type === 'lp') {
    return [
      // Flat passband from left
      `M ${PAD_L},${leftY}`,
      `L ${cx - shoulder},${leftY}`,
      // Steep rise to peak
      `C ${cx - rolloff * 0.5},${leftY} ${cx - 6},${peakY} ${cx},${peakY}`,
      // Rolloff — drifts right before dropping out of view
      `C ${cx + 6},${peakY} ${cx + shoulder * 1.5},${PASSBAND_Y + 60} ${cx + shoulder * 2.5},${STOPBAND_Y}`,
    ].join(' ')
  }

  if (type === 'hp') {
    return [
      // Flat stopband from left
      `M ${PAD_L},${STOPBAND_Y}`,
      `L ${cx - rolloff},${STOPBAND_Y}`,
      // Steep S-curve rise to resonance peak
      `C ${cx - rolloff * 0.5},${STOPBAND_Y} ${cx - 6},${peakY} ${cx},${peakY}`,
      // Drop to flat passband
      `C ${cx + 6},${peakY} ${cx + shoulder * 0.4},${rightY} ${cx + shoulder},${rightY}`,
      // Flat passband to right edge
      `L ${PAD_L + PLOT_W},${rightY}`,
    ].join(' ')
  }

  // BP
  return [
    `M ${PAD_L},${STOPBAND_Y}`,
    `L ${cx - rolloff},${STOPBAND_Y}`,
    `C ${cx - rolloff * 0.5},${STOPBAND_Y} ${cx - 6},${peakY} ${cx},${peakY}`,
    `C ${cx + 6},${peakY} ${cx + rolloff * 0.5},${STOPBAND_Y} ${cx + rolloff},${STOPBAND_Y}`,
    `L ${PAD_L + PLOT_W},${STOPBAND_Y}`,
  ].join(' ')
}

// Grid lines
const H_LINES = 4
const FREQ_MARKERS = [
  { freq: 50,    label: '50 Hz' },
  { freq: 500,   label: '500 Hz' },
  { freq: 5000,  label: '5 kHz' },
]

function cutoffToFreqLabel(cutoff: number): string {
  const freq = F_MIN * Math.pow(F_MAX / F_MIN, cutoff)
  if (freq >= 1000) return `${(freq / 1000).toFixed(1)} kHz`
  return `${Math.round(freq)} Hz`
}

export function FilterShape({ type, cutoff, resonance, onCutOffChange, onResonanceChange }: FilterShapeProps) {
  const pathD  = buildPath(type, cutoff, resonance)
  const cx     = cutoffToX(cutoff)
  const peakY  = PASSBAND_Y - resonance * PLOT_H * 0.45
  const freqLabel = cutoffToFreqLabel(cutoff)

  const isDragging = useRef(false)
  const lastX = useRef(0)
  const lastY = useRef(0)
  const [isActive, setIsActive] = useState(false)

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    isDragging.current = true
    setIsActive(true)
    lastX.current = e.clientX
    lastY.current = e.clientY
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const deltaX = e.clientX - lastX.current
    const deltaY = e.clientY - lastY.current
    lastX.current = e.clientX
    lastY.current = e.clientY

    const newCutoff    = Math.max(0, Math.min(1, xToCutoff(cx + deltaX)))
    const newResonance = Math.max(0, Math.min(1, resonance - deltaY / PLOT_H))
    onCutOffChange(newCutoff)
    onResonanceChange(newResonance)
  }

  const onPointerUp = () => {
    isDragging.current = false
    setIsActive(false)
  }

  return (
    <svg width={W} height={H} style={{ display: 'block', overflow: 'hidden' }}>
      <defs>
        <clipPath id="plot-area">
          <rect x={PAD_L} y={PAD_T} width={PLOT_W} height={PLOT_H} />
        </clipPath>
      </defs>

      {/* Horizontal dashed grid lines — skip top and bottom edges */}
      {Array.from({ length: H_LINES }).map((_, i) => {
        if (i === 0 || i === H_LINES - 1) return null
        const y = PAD_T + (i / (H_LINES - 1)) * PLOT_H
        return (
          <line
            key={`h${i}`}
            x1={PAD_L} y1={y} x2={PAD_L + PLOT_W} y2={y}
            stroke={colors.border.strong}
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        )
      })}

      {/* Vertical dashed grid lines + frequency labels */}
      {FREQ_MARKERS.map(({ freq, label }) => {
        const x = freqToX(freq)
        return (
          <g key={freq}>
            <line
              x1={x} y1={PAD_T} x2={x} y2={PAD_T + PLOT_H}
              stroke={colors.border.strong}
              strokeWidth={1}
              strokeDasharray="3 4"
            />
            <text
              x={x}
              y={H - 4}
              textAnchor="middle"
              fill={colors.text.muted}
              style={{ ...typography.label.sm, fontSize: 7 }}
            >
              {label}
            </text>
          </g>
        )
      })}

      {/* Filter curve — clipped to plot area */}
      <path
        d={pathD}
        fill="none"
        stroke={colors.bg.canvas}
        strokeWidth={2}
        strokeLinecap="round"
        clipPath="url(#plot-area)"
        style={{ ['d' as string]: `path("${pathD}")`, transition: 'd 0.35s ease' } as React.CSSProperties}
      />

      {/* Vertical line from handle to x-axis — only when active */}
      {isActive && (
        <line
          x1={cx} y1={peakY}
          x2={cx} y2={PAD_T + PLOT_H}
          stroke={colors.bg.canvas}
          strokeWidth={1}
          strokeDasharray="3 4"
          clipPath="url(#plot-area)"
        />
      )}

      {/* Frequency label — only when active */}
      {isActive && (
        <text
          x={cx + 14}
          y={peakY - 10}
          fill={colors.text.primary}
          style={{ ...typography.label.sm, fontSize: 7 }}
        >
          {freqLabel}
        </text>
      )}

      {/* Draggable handle */}
      <g
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ transform: `translate(${cx}px, ${peakY}px)`, cursor: 'grab', pointerEvents: 'auto' }}
      >
        {/* Outer ring — expands on active */}
        <motion.circle
          animate={{ r: isActive ? 14 : 10 }}
          fill="none"
          stroke={colors.control.indicator}
          strokeWidth={1}
          transition={{ type: 'spring', stiffness: 200, damping: 35 }}
        />
        {/* Inner filled circle */}
        <circle r={6} fill={colors.bg.canvas} />
      </g>

    </svg>
  )
}

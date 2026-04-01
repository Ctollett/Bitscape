import { useRef, useState } from 'react';

import { colors, typography, spacing } from '../tokens'

const SIZE = 40;
const RADIUS = 16;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SWEEP = 270;
const MAX_ARC = (SWEEP / 360) * CIRCUMFERENCE;
const START_DEG = 135; // 7 o'clock position from SVG 3 o'clock

interface PanelKnobProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}

export function PanelKnob({ value, onChange, label }: PanelKnobProps) {
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const [showValue, setShowValue] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastY.current = e.clientY;
    setShowValue(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if(!isDragging.current) return
    const delta = lastY.current - e.clientY
    lastY.current = e.clientY
    const newValue = Math.max(0, Math.min(1, value + delta / 150))
    onChange(newValue)
  }

  const onPointerUp = () => {
    isDragging.current = false;
    setShowValue(false);
  }

  // Indicator line at the tip of the value arc
  const indicatorAngleRad = (START_DEG + value * SWEEP) * (Math.PI / 180);
  const x1 = CENTER + RADIUS * Math.cos(indicatorAngleRad);
  const y1 = CENTER + RADIUS * Math.sin(indicatorAngleRad);
  const x2 = CENTER + 3 * Math.cos(indicatorAngleRad);
  const y2 = CENTER + 3 * Math.sin(indicatorAngleRad);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', userSelect: 'none', WebkitUserSelect: 'none', gap: spacing.sm }}>
      <svg width={SIZE} height={SIZE} style={{ cursor: 'ns-resize' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        {/* Track ring */}
        <circle
          strokeWidth={2} fill='none' stroke={colors.control.indicator}
          cx={CENTER} cy={CENTER} r={RADIUS}
        />
        {/* Value arc */}
        <circle style={{ pointerEvents: 'none' }}
          strokeDasharray={`${value * MAX_ARC} ${CIRCUMFERENCE}`}
          transform={`rotate(${START_DEG}, ${CENTER}, ${CENTER})`}
          strokeWidth={2} strokeLinecap="round" fill="none" stroke={colors.bg.canvas}
          cx={CENTER} cy={CENTER} r={RADIUS}
        />
        {/* Indicator line */}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.bg.canvas} strokeWidth={2} strokeLinecap="round" />
      </svg>
      <div style={{ display: 'grid' }}>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: 'black', userSelect: 'none', WebkitUserSelect: 'none', textAlign: 'center', opacity: showValue ? 0 : 1 }}>{label}</span>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: 'black', userSelect: 'none', WebkitUserSelect: 'none', textAlign: 'center', opacity: showValue ? 1 : 0 }}>{Math.round(value * 100)}</span>
      </div>
    </div>
  );
}

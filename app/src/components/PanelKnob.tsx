import { useRef, useState } from 'react';

import { colors, typography, spacing } from '../tokens'

const SIZE = 40;
const RADIUS = 16;
const SWEEP = 270;
const START_DEG = 135; // 7 o'clock position from SVG 3 o'clock

interface PanelKnobProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  color?: string;
  trackColor?: string;
  size?: number;
}

export function PanelKnob({ value, onChange, label, color, trackColor, size = SIZE }: PanelKnobProps) {
  const isDragging = useRef(false);
  const lastY = useRef(0);
  const accValue = useRef(value);
  const [showValue, setShowValue] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    lastY.current = e.clientY;
    accValue.current = value;
    setShowValue(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if(!isDragging.current) return
    const delta = lastY.current - e.clientY
    lastY.current = e.clientY
    accValue.current = Math.max(0, Math.min(1, accValue.current + delta / 150))
    onChange(accValue.current)
  }

  const onPointerUp = () => {
    isDragging.current = false;
    setShowValue(false);
  }

  // Indicator line at the tip of the value arc
  const scale = size / SIZE;
  const radius = RADIUS * scale;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const maxArc = (SWEEP / 360) * circumference;

  const indicatorAngleRad = (START_DEG + value * SWEEP) * (Math.PI / 180);
  const x1 = center + radius * Math.cos(indicatorAngleRad);
  const y1 = center + radius * Math.sin(indicatorAngleRad);
  const x2 = center + 3 * scale * Math.cos(indicatorAngleRad);
  const y2 = center + 3 * scale * Math.sin(indicatorAngleRad);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', userSelect: 'none', WebkitUserSelect: 'none', gap: spacing.sm }}>
      <svg width={size} height={size} style={{ cursor: 'ns-resize' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        {/* Track ring */}
        <circle
          strokeWidth={2} fill='none' stroke={trackColor ?? colors.control.track}
          cx={center} cy={center} r={radius}
        />
        {/* Value arc */}
        <circle style={{ pointerEvents: 'none' }}
          strokeDasharray={`${value * maxArc} ${circumference}`}
          transform={`rotate(${START_DEG}, ${center}, ${center})`}
          strokeWidth={2} strokeLinecap="round" fill="none" stroke={color}
          cx={center} cy={center} r={radius}
        />
        {/* Indicator line */}
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2} strokeLinecap="round" />
      </svg>
      <div style={{ display: 'grid' }}>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: colors.text.muted, userSelect: 'none', WebkitUserSelect: 'none', textAlign: 'center', opacity: showValue ? 0 : 1 }}>{label}</span>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: colors.text.muted, userSelect: 'none', WebkitUserSelect: 'none', textAlign: 'center', opacity: showValue ? 1 : 0 }}>{Math.round(value * 100)}</span>
      </div>
    </div>
  );
}

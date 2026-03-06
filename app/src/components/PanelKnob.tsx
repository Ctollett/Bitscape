import { useRef, useState } from 'react';

import { colors, borderWidth } from '../tokens'

const SIZE = 28;
const RADIUS = 11;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_ARC = (270 / 360) * CIRCUMFERENCE

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', userSelect: 'none', WebkitUserSelect: 'none'}}>
      <svg width={SIZE} height={SIZE}>
        <circle style={{cursor: 'pointer'}} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
 strokeWidth={borderWidth.heavy} fill='none' stroke={colors.bg.app} cx={CENTER} cy={CENTER} r={RADIUS} />
        <circle style={{pointerEvents: 'none'}}
strokeDasharray={`${value * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
transform={`rotate(90, ${CENTER}, ${CENTER})`}
 strokeWidth={borderWidth.heavy}  strokeLinecap="round" fill="none" stroke={colors.bg.canvas} cx={CENTER} cy={CENTER} r={RADIUS} />
      </svg>
      <span style={{color: 'black', userSelect: 'none', WebkitUserSelect: 'none'}}>
        {showValue ? Math.round(value * 100) : label}
      </span>
    </div>
  );
}

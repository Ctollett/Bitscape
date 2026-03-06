import { useRef, useState } from 'react';

import { borderRadius } from '../tokens';

import { colors } from '../tokens';

interface PanelSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
}


export function PanelSlider({ value, onChange, label }: PanelSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [showValue, setShowValue] = useState(false);

const onPointerDown = (e: React.PointerEvent) => {
  e.preventDefault();
  isDragging.current = true;
  setShowValue(true);
  e.currentTarget.setPointerCapture(e.pointerId);
}

const onPointerMove = (e: React.PointerEvent) => {
  if (!isDragging.current || !trackRef.current) return;
  const { top, height } = trackRef.current.getBoundingClientRect();
  const y = e.clientY - top;
  const newValue = Math.max(0, Math.min(1, 1 - y/height))
  onChange(newValue)
}

const onPointerUp = () => {
  isDragging.current = false;
  setShowValue(false);
}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', WebkitUserSelect: 'none'}}>
      <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}style={{cursor: 'pointer', position: 'relative', height: '128px', width: '8px', borderRadius: borderRadius.md, backgroundColor: colors.bg.app  }} ref={trackRef}>
        <div style={{position: 'absolute', backgroundColor: colors.bg.canvas, height: `${value * 128}px`, width: '8px', bottom: 0, borderRadius: borderRadius.md,  }} />
      </div>
      <span style={{color: 'black', userSelect: 'none', WebkitUserSelect: 'none'}}>
        {showValue ? Math.round(value * 100) : label}
      </span>
    </div>
  );
}

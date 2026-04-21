import { useRef, useState } from 'react';
import { borderRadius, colors, typography, spacing } from '../tokens';
import { motion } from 'framer-motion';

interface HorizontalSliderProps {
  value: number;
  steps?: number;
  labels?: string[];
  onChange: (value: number) => void;
  label?: string;
  width?: number;
}

const circleSize = 14;
const halfCircleSize = circleSize / 2;


export function HorizontalSlider({ value, steps, onChange, label, labels, width = 140 }: HorizontalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [showValue, setShowValue] = useState(false);
  const displayValue = steps ? value / (steps - 1) : value

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setShowValue(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current || !trackRef.current) return;
    const { left, width } = trackRef.current.getBoundingClientRect();
    const x = e.clientX - left;

  
    const newValue = Math.max(0, Math.min(1, x / width));

      if(steps) {
      const steppedValue = Math.round(newValue * (steps - 1))
      onChange(steppedValue)
    } else {
      onChange(newValue);
    }
  };

  const onPointerUp = () => {
    isDragging.current = false;
    setShowValue(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', userSelect: 'none', WebkitUserSelect: 'none', gap: spacing.sm }}>
      <div style={{ display: 'grid' }}>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: 'black', userSelect: 'none', WebkitUserSelect: 'none', opacity: showValue ? 0 : 1 }}>{label}</span>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: 'black', userSelect: 'none', WebkitUserSelect: 'none', opacity: showValue ? 1 : 0 }}>{labels ? labels[value] : Math.round(displayValue * 100)}</span>
      </div>
      <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ cursor: 'pointer', position: 'relative', width: `${width}px`, height: '2px', borderRadius: borderRadius.md, backgroundColor: colors.bg.app, overflow: 'visible' }} ref={trackRef}>
        <div style={{ position: 'absolute', backgroundColor: colors.bg.canvas, width: `${displayValue * width}px`, height: '2px', left: 0, borderRadius: borderRadius.md, overflow: 'visible' }} />
        <motion.div transition={{ type: 'spring', stiffness: 200, damping: 35 }} animate={{ width: showValue ? 24 : 16, height: showValue ? 24 : 16 }} style={{ display: 'flex', justifyContent: 'center', left: displayValue * width - halfCircleSize, top: '50%', transform: 'translateY(-50%)', position: 'absolute', alignItems: 'center', borderRadius: '50%', backgroundColor: 'transparent', border: '1px solid blue' }}>
          <div style={{ height: '12px', width: '12px', borderRadius: '50%', backgroundColor: colors.bg.canvas }} />
        </motion.div>
      </div>
    </div>
  );
}

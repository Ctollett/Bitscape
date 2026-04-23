import { useRef, useState } from 'react';

import { borderRadius, colors } from '../tokens';

import { typography } from '../tokens';

import { spacing } from '../tokens';

import { motion, animate } from 'framer-motion';

interface PanelSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  color?: string;
}

const circleSize = 14
const halfCircleSize = circleSize / 2



export function PanelSlider({ value, onChange, label, color = '#4E7AAA' }: PanelSliderProps) {
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
  const newValue = Math.max(0, Math.min(1, 1 - y / height))
  onChange(newValue)
}

const onPointerUp = () => {
  isDragging.current = false;
  setShowValue(false);
}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', userSelect: 'none', WebkitUserSelect: 'none', gap: spacing.sm, width: '16px' }}>
      <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}style={{cursor: 'pointer', position: 'relative', height: '140px', width: '2px', borderRadius: borderRadius.md, backgroundColor: colors.control.track, overflow: 'visible'  }} ref={trackRef}>
        <div style={{position: 'absolute', backgroundColor: color as unknown as string, height: `${value * 140}px`, width: '2px', bottom: 0, borderRadius: borderRadius.md, overflow: 'visible' }} />
        <motion.div  transition={{ type: 'spring', stiffness: 200, damping: 35 }} animate={{ width: showValue ? 24 : 16, height: showValue ? 24 : 16 }} style={{display: 'flex', justifyContent: 'center',  bottom: value * 140 - halfCircleSize, left: "50%", transform: 'translateX(-50%)', position: 'absolute',alignItems: 'center', borderRadius: '50%', backgroundColor: 'transparent', border: `1px solid ${color}`}}>
            <div style={{ height: '12px', width: '12px', borderRadius: '50%', backgroundColor: color,
                 }}>
        </div>
     </motion.div>    
      </div>
      <div style={{ display: 'grid', placeItems: 'center', minWidth: '24px', width: 'fit-content' }}>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: colors.text.muted, userSelect: 'none', WebkitUserSelect: 'none', textAlign: 'center', opacity: showValue ? 0 : 1 }}>{label}</span>
        <span style={{ gridArea: '1/1', ...typography.label.sm, color: colors.text.muted, userSelect: 'none', WebkitUserSelect: 'none', textAlign: 'center', opacity: showValue ? 1 : 0, fontVariantNumeric: 'tabular-nums', minWidth: '2ch' }}>{Math.round(value * 100)}</span>
      </div>
    </div>
  );
}

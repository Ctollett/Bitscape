import { useRef, useState } from 'react'
import { describeArc, START_DEG, SWEEP_DEG } from './knob-utils';
import { borderWidth, colors, sizing } from '../tokens';


export interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  size?: number;
  displayValue?: string;
  color?: string;
}


export function Knob({size=sizing.knob.sm, value, onChange, displayValue, label, min=0, max=127, color=colors.operator.carrier}: KnobProps) {
    const t = (value - min) / (max - min)
    const indicatorDeg = START_DEG + t * SWEEP_DEG
    const dragRef = useRef<{ startY: number, startValue: number} | null>(null)
    const [isActive, setIsActive] = useState(false)




    const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startValue: value}
    setIsActive(true)
}

    const onPointerMove = (e: React.PointerEvent) => {
    if(!dragRef.current) return
    const { startY, startValue } = dragRef.current;
    const deltaY = startY - e.clientY;

    const newValue = startValue + (deltaY / 180) * (max - min)
    const clamped = Math.min(Math.max(newValue, min), max)
    const rounded = Math.round(clamped)
if (rounded !== value) onChange(rounded)

}

    const onPointerUp = () => {
        dragRef.current = null
        setIsActive(false)
    }    



return (


    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <svg onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ cursor: 'ns-resize' }} width={size} height={size}>
         <circle r={size * 0.3} stroke={colors.control.handle} strokeWidth={borderWidth.default} cx={size/2} cy={size/2} fill="none"></circle>
         <path fill="none" stroke={colors.control.indicator} strokeWidth={borderWidth.track} d={describeArc(size/2, size/2, size * 0.42, START_DEG, START_DEG + SWEEP_DEG)} ></path>
         {t > 0 && <path fill="none" stroke={color} strokeWidth={borderWidth.track} d={describeArc(size/2, size/2, size * 0.42, START_DEG, indicatorDeg)} />}
<rect
  fill={colors.control.handle}
  x={size/2 - 1.5}
  y={size/2 - size * 0.22}
  width={3}
  height={size * 0.15}
  rx={1.5}
  transform={`rotate(${indicatorDeg - 270}, ${size/2}, ${size/2})`}
/>



        </svg>
 <div style={{display: 'grid'}}>
   <span style={{gridArea: '1/1', fontSize: '12px', textAlign: 'center', opacity: isActive ? 0 : 1}}>{label}</span>
   <span style={{gridArea: '1/1', fontSize: '12px', textAlign: 'center', opacity: isActive ? 1 : 0}}>{displayValue ?? String(value)}</span>
 </div>

    </div>

)


}

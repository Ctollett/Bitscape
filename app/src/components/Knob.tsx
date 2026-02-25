import {useRef} from 'react'
import { polarXY, describeArc, START_DEG, SWEEP_DEG } from './knob-utils';


export interface KnobProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  size?: number;
  displayValue?: string;
}


export function Knob({size=52,value, onChange, displayValue, label, min=0, max=127}: KnobProps) {
    const t = (value - min) / (max - min)
    const indicatorDeg = START_DEG + t * SWEEP_DEG
    const dragRef = useRef<{ startY: number, startValue: number} | null>(null)
    const indicatorStart = polarXY(size/2, size/2, size * 0.38, indicatorDeg)
    const indicatorEnd = polarXY(size/2, size/2, size * 0.10, indicatorDeg)



    const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startValue: value}
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
    }    



return (


    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
        <span style={{fontSize: '12px'}}>{displayValue ?? String(value) }</span>
        <svg onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ cursor: 'ns-resize' }} width={size} height={size}>
         <circle r={size * 0.3} stroke='white' cx={size/2} cy={size/2}></circle>
         <path fill="none" stroke="grey" d={describeArc(size/2, size/2, size * 0.42, START_DEG, START_DEG + SWEEP_DEG)} ></path>
         {t > 0 && <path fill="none" stroke="blue" d={describeArc(size/2, size/2, size * 0.42, START_DEG, indicatorDeg)} />}
         <line stroke='grey' x1={indicatorStart.x} y1={indicatorStart.y} x2={indicatorEnd.x} y2={indicatorEnd.y} />
        </svg>
 <span>{label}</span>

    </div>

)


}

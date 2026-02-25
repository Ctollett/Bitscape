import {useRef} from 'react'


export interface SteppedKnobProps {
  value: number;
  steps: readonly number[];
  onChange: (value: number) => void;
  label?: string;
  size?: number;
  displayValue?: string;
}


import { polarXY, describeArc, START_DEG, SWEEP_DEG } from './knob-utils';


export function SteppedKnob({size=52, steps, value, onChange, displayValue, label}: SteppedKnobProps) {
    const t = steps.indexOf(value) / (steps.length - 1)
    const indicatorDeg = START_DEG + t * SWEEP_DEG
    const dragRef = useRef<{ startY: number; startIndex: number } | null>(null)
    const currentIndex = steps.indexOf(value)
    const indicatorStart = polarXY(size/2, size/2, size * 0.38, indicatorDeg)
    const indicatorEnd = polarXY(size/2, size/2, size * 0.10, indicatorDeg)


    const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startIndex: currentIndex }
}

    const onPointerMove = (e: React.PointerEvent) => {
    if(!dragRef.current) return
    const { startY, startIndex } = dragRef.current;
    const deltaY = startY - e.clientY;
    const pixPerStep = 180 / (steps.length - 1);
    const newIndex = Math.round(startIndex + deltaY / pixPerStep)
    const clamped = Math.min(Math.max(newIndex, 0), steps.length - 1)
    if(steps[clamped] !== value) onChange(steps[clamped])
}

    const onPointerUp = () => {
        dragRef.current = null
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
            <span style={{fontSize: '12px'}}>{displayValue ?? String(value) }</span>
            <svg onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ cursor: 'ns-resize' }} width={size} height={size}>
            <circle r={size * 0.3} stroke='white' cx={size/2} cy={size/2}></circle>
            <path fill="none" stroke="green" d={describeArc(size/2, size/2, size * 0.42, START_DEG, START_DEG + SWEEP_DEG)} ></path>
            {t > 0 && <path fill="none" stroke="blue" d={describeArc(size/2, size/2, size * 0.42, START_DEG, indicatorDeg)} ></path>}
            {steps.map((step, i) => {
                const tick = i / (steps.length - 1)
                const tickAngle = START_DEG + tick * SWEEP_DEG
                const startTick = polarXY(size/2, size/2, size * 0.38, tickAngle)
                const endTick = polarXY(size/2, size/2, size * 0.46, tickAngle)
                return <line x1={startTick.x} y1={startTick.y} x2={endTick.x} y2={endTick.y} key={i} stroke="grey" strokeWidth={2}></line>
             
            })} 
             <line stroke='grey' x1={indicatorStart.x} y1={indicatorStart.y} x2={indicatorEnd.x} y2={indicatorEnd.y} />
            </svg>
            <span>{label}</span>
        </div>
    )

}

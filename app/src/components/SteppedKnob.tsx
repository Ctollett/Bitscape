import {useRef, useState} from 'react'



export interface SteppedKnobProps {
  value: number;
  steps: readonly number[];
  onChange: (value: number) => void;
  label?: string;
  size?: number;
  width?: number;
  height?: number;
  displayValue?: string;
  color?: string;
}


import { polarXY, START_DEG, SWEEP_DEG } from './knob-utils';
import { colors } from '../tokens';


export function SteppedKnob({size=52, width: wProp, height: hProp, steps, value, onChange, displayValue, label, color=colors.operator.carrier}: SteppedKnobProps) {
    const w = wProp ?? size
    const h = hProp ?? size
    const cx = w / 2
    const cy = h / 2
    const r = Math.min(w, h) / 2
    const t = steps.indexOf(value) / (steps.length - 1)
    const indicatorDeg = START_DEG + t * SWEEP_DEG
    const dragRef = useRef<{ startY: number; startIndex: number } | null>(null)
    const [isActive, setIsActive] = useState(false)
    const currentIndex = steps.indexOf(value)
    const indicatorStart = polarXY(cx, cy, r * 0.386, indicatorDeg)
    const indicatorEnd = polarXY(cx, cy, r * 0.667, indicatorDeg)
    const BLOB_PATH = "M47.0864 4.41219C49.2483 6.19687 51.8147 7.42422 54.5708 7.98154C62.624 9.61593 68.3447 16.7233 68.1614 24.8639C68.0982 27.6505 68.7367 30.4058 70.0072 32.8856C73.7367 40.1433 71.695 49.004 65.1588 53.9385C62.9211 55.6292 61.1385 57.8397 59.9754 60.3758C56.5746 67.7901 48.3064 71.7351 40.3353 69.7438C37.6109 69.0612 34.7537 69.0612 32.0292 69.7438C24.0582 71.7351 15.79 67.7901 12.3892 60.3758C11.2261 57.8397 9.44347 55.6292 7.20575 53.9385C0.663277 49.004 -1.37848 40.1433 2.35737 32.8856C3.63426 30.4058 4.26638 27.6443 4.20317 24.8639C4.01985 16.7233 9.74057 9.61593 17.7938 7.98154C20.5499 7.42422 23.1226 6.19687 25.2782 4.41219C31.5868 -0.804065 40.7652 -0.804065 47.0738 4.41219H47.0864Z"
    const BLOB_ROTATION_OFFSET = -15 // degrees, adjust to align blob orientation
    const blobScale = r * 1.263 / 73
    const blobX = cx - 73 * blobScale / 2
    const blobY = cy - 71 * blobScale / 2


    const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startIndex: currentIndex }
    setIsActive(true)
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
        setIsActive(false)
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 135}}>
            <svg onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} style={{ cursor: 'ns-resize', overflow: 'visible' }} width={w} height={h}>
            <g transform={`translate(${blobX}, ${blobY}) scale(${blobScale})`}>
              <path d={BLOB_PATH} fill={color} style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: `rotate(${indicatorDeg + BLOB_ROTATION_OFFSET}deg)` }} />
            </g>

            {steps.map((_step, i) => {
                const tick = i / (steps.length - 1)
                const tickAngle = START_DEG + tick * SWEEP_DEG
                const isCurrent = i === currentIndex
                const startTick = polarXY(cx, cy, r * 0.772, tickAngle)
                const endTick = polarXY(cx, cy, r * 1.193, tickAngle)
                return <line x1={startTick.x} y1={startTick.y} x2={endTick.x} y2={endTick.y} key={i} stroke={isCurrent ? color : 'grey'} strokeWidth={3} strokeLinecap='round'></line>
            })}
             <line stroke='white' strokeWidth={4} strokeLinecap='round' x1={indicatorStart.x} y1={indicatorStart.y} x2={indicatorEnd.x} y2={indicatorEnd.y} />
            </svg>
            <div style={{display: 'grid'}}>
                <span style={{gridArea: '1/1', fontSize: '12px', textAlign: 'center', opacity: isActive ? 0 : 1}}>{label}</span>
                <span style={{gridArea: '1/1', fontSize: '12px', textAlign: 'center', opacity: isActive ? 1 : 0}}>{displayValue ?? String(value)}</span>
            </div>
        </div>
    )

}

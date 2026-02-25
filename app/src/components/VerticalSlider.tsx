import { useRef } from 'react'


export interface VerticalSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  displayValue?: string;
  height?: number;
  width?: number;
}

export function VerticalSlider({
  value,
  min = 0,
  max = 127,
  onChange,
  label,
  displayValue,
  height = 80,
  width = 32,
}: VerticalSliderProps) {

  const padding = 6;
  const trackX = width / 2
  const trackTop = padding;
  const trackBottom = height - padding;
  const trackHeight = trackBottom - trackTop;
  const ticks = [0, 0.25, 0.5, 0.75, 1]

  const t = (value - min) / (max - min)
  const handleY = trackBottom - t * trackHeight;

  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  const onPointerDown = (e: React.PointerEvent ) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true
    const newValue = yToValue(e.clientY)
    if(newValue !== value) onChange(newValue)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if(!dragging.current) return
    const newValue = yToValue(e.clientY)
    if (newValue !== value) onChange(newValue)
  }

  const onPointerUp = () => {
    dragging.current = false;
  }

  const yToValue = (clientY: number) => {
    if(!svgRef.current) return value;
    const rect = svgRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const clamped = Math.max(trackTop, Math.min(trackBottom, y))
    const newT = 1 - (clamped - trackTop) / trackHeight;
    return Math.round(min + newT * (max - min))
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '12px' }}>{displayValue ?? String(value)}</span>
      <svg ref={svgRef} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerMove={onPointerMove} width={width} height={height}>
        <line x1={trackX} x2={trackX} y1={trackTop} y2={trackBottom} stroke="grey" strokeWidth={2} />
        <line x1={trackX} x2={trackX} y1={trackBottom} y2={handleY} />
        <circle cx={trackX} cy={handleY} r={5} stroke="white" fill="white" />

        {ticks.map((tick) => {
          const tickY = trackBottom - tick * trackHeight;
          return (
            <line key={tick} x1={trackX - 4} x2={trackX + 4} y1={tickY} y2={tickY} stroke="grey" strokeWidth={1} />
          )
        })}

      </svg>
      <span>{label}</span>
    </div>
  );
}

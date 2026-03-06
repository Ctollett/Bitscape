import { useRef, useState } from 'react'
import { colors } from '../tokens'

const TICK_WIDTH = 8
const TICK_HEIGHT = 2
const TICK_GAP = 4

export interface VerticalSliderProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  displayValue?: string;
  height?: number;
  width?: number;
  color?: string;
}

export function VerticalSlider({
  value,
  min = 0,
  max = 127,
  onChange,
  label,
  displayValue,
  height = 112,
  width = 36,
  color = colors.operator.carrier,
}: VerticalSliderProps) {

  const padding = 0;
  const trackWidth = 8;
  const trackX = width / 2;
  const trackTop = padding;
  const trackBottom = height - padding;
  const trackHeight = trackBottom - trackTop;
  const handleRadius = 6;
  const tickCount = Math.round(trackHeight / 7);
  const t = (value - min) / (max - min);
  const handleY = trackBottom - t * trackHeight;

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const [isActive, setIsActive] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    setIsActive(true);
    const newValue = yToValue(e.clientY);
    if (newValue !== value) onChange(newValue);
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const newValue = yToValue(e.clientY);
    if (newValue !== value) onChange(newValue);
  }

  const onPointerUp = () => {
    dragging.current = false;
    setIsActive(false);
  }

  const yToValue = (clientY: number) => {
    if (!svgRef.current) return value;
    const rect = svgRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const clamped = Math.max(trackTop, Math.min(trackBottom, y));
    const newT = 1 - (clamped - trackTop) / trackHeight;
    return Math.round(min + newT * (max - min));
  }

  const ticks = Array.from({ length: tickCount }, (_, i) => i / (tickCount - 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 134 }}>
      <svg ref={svgRef} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerMove={onPointerMove} width={width} height={height} style={{ cursor: 'ns-resize', overflow: 'visible' }}>

        {/* Track background */}
        <rect
          x={trackX - trackWidth / 2}
          y={trackTop}
          width={trackWidth}
          height={trackHeight}
          rx={4} ry={4}
          fill={colors.control.indicator}
        />
        {/* Track fill */}
        <rect
          x={trackX - trackWidth / 2}
          y={handleY}
          width={trackWidth}
          height={trackBottom - handleY}
          rx={4} ry={4}
          fill={color}
        />

        {/* Ticks */}
        {ticks.slice(1, -1).map((tick) => {
          const tickY = trackBottom - tick * trackHeight;
          const isBelow = tickY >= handleY;
          const tickColor = isBelow ? color : colors.control.indicator;
          return (
            <g key={tick}>
              <line
                x1={trackX - trackWidth / 2 - TICK_GAP - TICK_WIDTH}
                y1={tickY}
                x2={trackX - trackWidth / 2 - TICK_GAP}
                y2={tickY}
                stroke={tickColor} strokeWidth={TICK_HEIGHT} strokeLinecap='round'
              />
              <line
                x1={trackX + trackWidth / 2 + TICK_GAP}
                y1={tickY}
                x2={trackX + trackWidth / 2 + TICK_GAP + TICK_WIDTH}
                y2={tickY}
                stroke={tickColor} strokeWidth={TICK_HEIGHT} strokeLinecap='round'
              />
            </g>
          );
        })}

        {/* Handle */}
        <circle cx={trackX} cy={handleY} r={handleRadius} fill={color} />

      </svg>
      <div style={{ display: 'grid' }}>
        <span style={{ gridArea: '1/1', fontSize: '12px', textAlign: 'center', opacity: isActive ? 0 : 1 }}>{label}</span>
        <span style={{ gridArea: '1/1', fontSize: '12px', textAlign: 'center', opacity: isActive ? 1 : 0 }}>{displayValue ?? String(value)}</span>
      </div>
    </div>
  );
}

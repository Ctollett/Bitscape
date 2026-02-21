import { useState, useRef, useCallback } from 'react';

interface EnvelopeEditorProps {
  attack: number;   // 0-127
  decay: number;    // 0-127
  sustain: number;  // 0-127
  release: number;  // 0-127
  onChange: (params: { attack: number; decay: number; sustain: number; release: number }) => void;
  width?: number;
  height?: number;
}

export function EnvelopeEditor({
  attack,
  decay,
  sustain,
  release,
  onChange,
  width = 300,
  height = 120,
}: EnvelopeEditorProps) {
  const [dragging, setDragging] = useState<'attack' | 'decay' | 'sustain' | 'release' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; value: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Map 0-127 to pixel coordinates
  const padding = 20;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Ableton-style proportional layout based on time values
  // Normalize time values to create proportional widths
  const attackNorm = Math.max(1, attack);
  const decayNorm = Math.max(1, decay);
  const releaseNorm = Math.max(1, release);
  const sustainTimeNorm = 40; // Fixed sustain section width
  const totalNorm = attackNorm + decayNorm + sustainTimeNorm + releaseNorm;

  const attackWidth = (attackNorm / totalNorm) * graphWidth;
  const decayWidth = (decayNorm / totalNorm) * graphWidth;
  const sustainWidth = (sustainTimeNorm / totalNorm) * graphWidth;
  const releaseWidth = (releaseNorm / totalNorm) * graphWidth;

  // Control point positions
  const x0 = padding; // Start
  const x1 = x0 + attackWidth; // Attack peak
  const x2 = x1 + decayWidth; // Decay end (sustain start)
  const x3 = x2 + sustainWidth; // Sustain end (release start)
  const x4 = x3 + releaseWidth; // Release end

  const y0 = height - padding; // Baseline
  const yPeak = padding; // Top (attack peak)
  const ySustain = y0 - (sustain / 127) * graphHeight; // Sustain level

  // Generate SVG path
  const path = `
    M ${x0} ${y0}
    L ${x1} ${yPeak}
    L ${x2} ${ySustain}
    L ${x3} ${ySustain}
    L ${x4} ${y0}
  `;

  // Filled path (Ableton-style)
  const filledPath = `
    M ${x0} ${y0}
    L ${x1} ${yPeak}
    L ${x2} ${ySustain}
    L ${x3} ${ySustain}
    L ${x4} ${y0}
    L ${x4} ${y0}
    Z
  `;

  const handlePointerDown = (point: 'attack' | 'decay' | 'sustain' | 'release', e: React.PointerEvent) => {
    if (!svgRef.current) return;

    setDragging(point);
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Store initial drag position and parameter value
    const value = point === 'attack' ? attack : point === 'decay' ? decay : point === 'sustain' ? sustain : release;
    setDragStart({ x, y, value });
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!dragging || !dragStart || !svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (dragging === 'attack') {
        // Attack: horizontal drag controls attack time (Ableton-style)
        // Map horizontal delta to parameter change
        const deltaX = x - dragStart.x;
        const deltaNorm = (deltaX / graphWidth) * 255; // Map to 0-255 range for sensitivity
        const newAttack = Math.max(0, Math.min(127, Math.round(dragStart.value + deltaNorm)));
        onChange({ attack: newAttack, decay, sustain, release });
      } else if (dragging === 'decay') {
        // Decay: horizontal drag controls decay time
        const deltaX = x - dragStart.x;
        const deltaNorm = (deltaX / graphWidth) * 255;
        const newDecay = Math.max(0, Math.min(127, Math.round(dragStart.value + deltaNorm)));
        onChange({ attack, decay: newDecay, sustain, release });
      } else if (dragging === 'sustain') {
        // Sustain: vertical drag controls sustain level (Ableton-style)
        const deltaY = dragStart.y - y; // Inverted: up = increase
        const deltaNorm = (deltaY / graphHeight) * 127;
        const newSustain = Math.max(0, Math.min(127, Math.round(dragStart.value + deltaNorm)));
        onChange({ attack, decay, sustain: newSustain, release });
      } else if (dragging === 'release') {
        // Release: horizontal drag controls release time
        const deltaX = x - dragStart.x;
        const deltaNorm = (deltaX / graphWidth) * 255;
        const newRelease = Math.max(0, Math.min(127, Math.round(dragStart.value + deltaNorm)));
        onChange({ attack, decay, sustain, release: newRelease });
      }
    },
    [dragging, dragStart, attack, decay, sustain, release, onChange, graphWidth, graphHeight]
  );

  const handlePointerUp = () => {
    setDragging(null);
    setDragStart(null);
  };

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{
        cursor: dragging === 'sustain' ? 'ns-resize' : dragging ? 'ew-resize' : 'default',
        userSelect: 'none'
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Background */}
      <rect x={0} y={0} width={width} height={height} fill="#1a1a1a" rx={4} />

      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={ratio}
          x1={padding}
          y1={y0 - ratio * graphHeight}
          x2={width - padding}
          y2={y0 - ratio * graphHeight}
          stroke="#2a2a2a"
          strokeWidth={1}
          opacity={0.5}
        />
      ))}

      {/* Filled area under envelope (Ableton-style) */}
      <path 
        d={filledPath} 
        fill="url(#envelopeGradient)" 
        opacity={0.3}
      />
      
      {/* Gradient definition */}
      <defs>
        <linearGradient id="envelopeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a9eff" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#4a9eff" stopOpacity={0.1} />
        </linearGradient>
      </defs>

      {/* Envelope path */}
      <path d={path} fill="none" stroke="#4a9eff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

      {/* Attack point */}
      <circle
        cx={x1}
        cy={yPeak}
        r={5}
        fill="#1a1a1a"
        stroke="#4a9eff"
        strokeWidth={2.5}
        style={{ cursor: 'ew-resize', filter: 'drop-shadow(0 0 4px rgba(74, 158, 255, 0.6))' }}
        onPointerDown={(e) => handlePointerDown('attack', e)}
      />

      {/* Decay point */}
      <circle
        cx={x2}
        cy={ySustain}
        r={5}
        fill="#1a1a1a"
        stroke="#4a9eff"
        strokeWidth={2.5}
        style={{ cursor: 'ew-resize', filter: 'drop-shadow(0 0 4px rgba(74, 158, 255, 0.6))' }}
        onPointerDown={(e) => handlePointerDown('decay', e)}
      />

      {/* Sustain level indicator (vertical drag) */}
      <circle
        cx={x2 + sustainWidth / 2}
        cy={ySustain}
        r={5}
        fill="#1a1a1a"
        stroke="#4a9eff"
        strokeWidth={2.5}
        style={{ cursor: 'ns-resize', filter: 'drop-shadow(0 0 4px rgba(74, 158, 255, 0.6))' }}
        onPointerDown={(e) => handlePointerDown('sustain', e)}
      />

      {/* Release point */}
      <circle
        cx={x4}
        cy={y0}
        r={5}
        fill="#1a1a1a"
        stroke="#4a9eff"
        strokeWidth={2.5}
        style={{ cursor: 'ew-resize', filter: 'drop-shadow(0 0 4px rgba(74, 158, 255, 0.6))' }}
        onPointerDown={(e) => handlePointerDown('release', e)}
      />

      {/* Labels - Ableton style (minimal, cleaner) */}
      <text x={x1} y={yPeak - 10} fill="#4a9eff" fontSize={11} textAnchor="middle" fontWeight="500">
        A
      </text>
      <text x={x2} y={ySustain - 10} fill="#4a9eff" fontSize={11} textAnchor="middle" fontWeight="500">
        D
      </text>
      <text x={x2 + sustainWidth / 2} y={ySustain - 10} fill="#4a9eff" fontSize={11} textAnchor="middle" fontWeight="500">
        S
      </text>
      <text x={x4} y={y0 + 15} fill="#4a9eff" fontSize={11} textAnchor="middle" fontWeight="500">
        R
      </text>
      
      {/* Value display when dragging */}
      {dragging && (
        <text 
          x={width / 2} 
          y={15} 
          fill="#fff" 
          fontSize={12} 
          textAnchor="middle" 
          fontWeight="600"
        >
          {dragging === 'attack' && `Attack: ${attack}ms`}
          {dragging === 'decay' && `Decay: ${decay}ms`}
          {dragging === 'sustain' && `Sustain: ${sustain}`}
          {dragging === 'release' && `Release: ${release}ms`}
        </text>
      )}
    </svg>
  );
}

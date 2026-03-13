import { useState } from 'react'
import type { WaveTypeId } from './types';
import { spacing, typography } from '../tokens'

import SineIcon from '../component-images/sine.svg?react'
import SawIcon from '../component-images/saw.svg?react'
import SquareIcon from '../component-images/square.svg?react'
import TriangleIcon from '../component-images/triangle.svg?react'

export interface OptionMenuProps<T extends string | number> {
  options: { id: T; label: React.ReactNode }[];
  value: T;
  onChange: (value: T) => void;
  color?: string;
  gap?: number;
}

export function OptionMenu<T extends string | number>({ options, value, onChange, color, gap = spacing.sm }: OptionMenuProps<T>) {
  const [hovered, setHovered] = useState<T | null>(null)

  return (
    <div>
      <ul style={{ display: 'flex', listStyle: 'none', gap, margin: 0, padding: 0 }}>
        {options.map((option) => {
          const isActive = option.id === value
          const isHovered = option.id === hovered

          return (
            <li key={option.id}>
              <button
                onMouseEnter={() => setHovered(option.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ ...typography.label.lg, lineHeight: 1, display: 'block', color: isActive ? color : isHovered ? '#aaa' : '#555', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, margin: 0 }}
                onClick={() => onChange(option.id)}
              >
                {option.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const WAVES = [
  { id: 0 as WaveTypeId, label: <SineIcon /> },
  { id: 1 as WaveTypeId, label: <SawIcon /> },
  { id: 2 as WaveTypeId, label: <SquareIcon /> },
  { id: 3 as WaveTypeId, label: <TriangleIcon /> },
]

export interface WaveMenuProps {
  value: WaveTypeId;
  onChange: (value: WaveTypeId) => void;
  color?: string;
}

export function WaveMenu({ value, onChange, color }: WaveMenuProps) {
  return <OptionMenu options={WAVES} value={value} onChange={onChange} color={color} />
}

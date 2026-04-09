import { useState } from 'react'
import LeftArrow from '../assets/svgs/left-arrow.svg?react';
import RightArrow from '../assets/svgs/right-arrow.svg?react';
import { spacing, typography, colors, borderRadius } from '../tokens';
import { usePatch } from '../fm-canvas/patch-context';
import { loadLibrary } from '../fm-canvas/patch-storage';

export function PresetSelect() {

  const { patch, dispatch } = usePatch()
  const [presetIndex, setPresetIndex] = useState<number>(0)
  const [isEditing, setIsEditing] = useState(false)
  const [presets, setPresets] = useState(() => loadLibrary())
  

  return (
    <div style={{ gridRow: '1 / 3', display: 'grid', gridTemplateRows: 'subgrid', alignItems: 'center', justifyItems: 'center' }}>
      {/* Row 1: pill */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <button style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}><LeftArrow /></button>
        <span style={{...typography.label.lg, width: '84px', height: '28px', borderRadius: borderRadius.md, display: 'flex', justifyContent: 'center', alignItems: 'center',color: colors.text.secondary}}>SOFT PAD</span>
        <button style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}><RightArrow /></button>
      </div>
      {/* Row 2: category + dots */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xs }}>
        <span style={{ ...typography.label.sm, lineHeight: 1 }}>PAD·047</span>
        <span style={{ ...typography.label.sm, lineHeight: 1 }}>•••</span>
      </div>
    </div>
  );
}

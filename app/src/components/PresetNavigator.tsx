import LeftArrow from '../assets/svgs/left-arrow.svg?react';
import RightArrow from '../assets/svgs/right-arrow.svg?react';
import { spacing, typography, colors, borderRadius } from '../tokens';
import type { SavedPatch } from '../fm-canvas/patch-storage';

interface PresetNavigatorProps {
  presets: SavedPatch[]
  presetIndex: number
  onNavigate: (direction: 1 | -1) => void
}

export function PresetNavigator({ presets, presetIndex, onNavigate }: PresetNavigatorProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
      <button onClick={() => onNavigate(-1)} style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}>
        <LeftArrow />
      </button>
      <span style={{ ...typography.label.lg, width: '84px', height: '28px', borderRadius: borderRadius.md, display: 'flex', justifyContent: 'center', alignItems: 'center', color: colors.text.secondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {presets.length > 0 ? presets[presetIndex].name : 'No Presets'}
      </span>
      <button onClick={() => onNavigate(1)} style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}>
        <RightArrow />
      </button>
    </div>
  )
}

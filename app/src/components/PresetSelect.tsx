import LeftArrow from '../assets/svgs/left-arrow.svg?react';
import RightArrow from '../assets/svgs/right-arrow.svg?react';
import { spacing, typography, colors, borderRadius } from '../tokens';

export function PresetSelect() {
  return (
    <div style={{ gridRow: '1 / 3', display: 'grid', gridTemplateRows: 'subgrid', alignItems: 'center', justifyItems: 'center' }}>
      {/* Row 1: pill */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <button style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}><LeftArrow /></button>
        <span style={{...typography.label.lg, backgroundColor: colors.text.muted, width: '120px', height: '28px', borderRadius: borderRadius.md, display: 'flex', justifyContent: 'center', alignItems: 'center',color: colors.text.inverse}}>SOFT PAD</span>
        <button style={{ backgroundColor: 'transparent', border: 'none', padding: 0, margin: 0, lineHeight: 1, display: 'flex' }}><RightArrow /></button>
      </div>
      {/* Row 2: category + dots */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <span style={{ ...typography.label.sm, lineHeight: 1 }}>PAD·047</span>
        <span style={{ ...typography.label.sm, lineHeight: 1 }}>•••</span>
      </div>
    </div>
  );
}

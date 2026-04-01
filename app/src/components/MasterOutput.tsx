import { useState } from 'react';
import { PanelKnob } from './PanelKnob';
import { colors, spacing, typography, borderRadius } from '../tokens';

export function MasterOutput() {
  const [drive, setDrive] = useState(0);
  const [mix, setMix] = useState(0.5);

  return (
    <div style={{ gridRow: '1 / 3', display: 'grid', gridTemplateRows: 'subgrid', gridTemplateColumns: 'auto auto', alignItems: 'center', columnGap: spacing.md }}>
      {/* L meter — row 1 */}
      <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <span style={{ ...typography.label.lg, lineHeight: 1, width: 8 }}>L</span>
        <div style={{ width: 160, height: 12, backgroundColor: colors.control.track, borderRadius: borderRadius.full }} />
      </div>
      {/* Knobs — span both rows */}
      <div style={{ gridRow: '1 / 3', gridColumn: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <PanelKnob value={drive} onChange={setDrive} label="DRIVE" />
        <PanelKnob value={mix} onChange={setMix} label="MIX" />
      </div>
      {/* R meter — row 2 */}
      <div style={{ alignSelf: 'flex-start', marginTop: -4, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <span style={{ ...typography.label.lg, lineHeight: 1, width: 8 }}>R</span>
        <div style={{ width: 160, height: 12, backgroundColor: colors.control.track, borderRadius: borderRadius.full }} />
      </div>
    </div>
  );
}

import { useState } from 'react';
import { PanelKnob } from '../components/PanelKnob';
import {colors} from '../tokens'

export function FilterKnobs() {
  // TODO: add filterDrive and filterMix to patch state
  const [filterDrive, setFilterDrive] = useState(0);
  const [filterMix, setFilterMix] = useState(1);

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <PanelKnob color={colors.section.filter} value={filterDrive} onChange={setFilterDrive} label="Drive" />
      <PanelKnob color={colors.section.filter} value={filterMix} onChange={setFilterMix} label="Mix" />
    </div>
  );
}

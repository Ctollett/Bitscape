import { useState } from 'react';
import { colors, spacing } from '../tokens';
import { OptionMenu } from '../fm-canvas/WaveMenu'
import { FilterPanel } from './FilterPanel';
import { EffectsPanel } from '../components/global-params/EffectsPanel';
import { LFOPanel } from '../components/global-params/LFOPanel';

type Tab = 'filter' | 'effects' | 'lfo1' | 'lfo2';

  const TABS: { id: Tab; label: string } [] = [
    { id: 'filter',  label: 'FILTER' },
  { id: 'effects', label: 'EFFECTS' },
  { id: 'lfo1',   label: 'LFO 1' },
  { id: 'lfo2',   label: 'LFO 2' },
  ];


export function TabPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('filter')

  return (
   <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      <div style={{ paddingLeft: 24, paddingRight: 24, paddingTop: 24 }}>
        <OptionMenu options={TABS} value={activeTab} onChange={setActiveTab} color={colors.text.primary} gap={spacing['2xl']} />
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: 24, paddingLeft: activeTab === 'effects' ? 48 : 72, paddingRight: activeTab === 'effects' ? 48 : 72 }}>
        {activeTab === 'filter'  && <FilterPanel/>}
        {activeTab === 'effects' && <EffectsPanel/>}
        {activeTab === 'lfo1'   && <LFOPanel lfoIndex={1} lfoColor={colors.section.lfo1}/>}
        {activeTab === 'lfo2'   && <LFOPanel lfoIndex={2} lfoColor={colors.section.lfo2}/>}
      </div>
    </div>
  );
}

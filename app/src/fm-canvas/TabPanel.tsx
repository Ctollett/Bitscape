import { useState } from 'react';
import { typography, colors, spacing } from '../tokens';
import { OptionMenu } from '../fm-canvas/WaveMenu'
import { FilterPanel } from './FilterPanel';
import { EffectsPanel } from '../components/global-params/EffectsPanel';
import { LFO1Panel } from '../components/global-params/LFO1Panel';
import { LFO2Panel } from '../components/global-params/LFO2Panel';

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
   <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 24, paddingLeft: 24, paddingRight: 24, paddingBottom: 24, boxSizing: 'border-box' }}>
      <OptionMenu options={TABS} value={activeTab} onChange={setActiveTab} color="blue" gap={spacing['2xl']} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 16 }}>
        {activeTab === 'filter'  && <FilterPanel/>}
        {activeTab === 'effects' && <EffectsPanel/>}
        {activeTab === 'lfo1'   && <LFO1Panel/>}
        {activeTab === 'lfo2'   && <LFO2Panel/>}
      </div>
    </div>
  );
}

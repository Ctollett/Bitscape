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
   <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 24, paddingLeft: 24 }}>
      <OptionMenu options={TABS} value={activeTab} onChange={setActiveTab} color="blue" gap={spacing['2xl']} />
      <div style={{ flex: 1, paddingTop: spacing.xl, gap: spacing['2xl'] }}>
        {activeTab === 'filter'  && <div><FilterPanel/></div>}
        {activeTab === 'effects' && <div><EffectsPanel/></div>}
        {activeTab === 'lfo1'   && <div><LFO1Panel/></div>}
        {activeTab === 'lfo2'   && <div><LFO2Panel/></div>}
      </div>
    </div>
  );
}

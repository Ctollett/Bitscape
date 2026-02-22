import { ADSRSection } from "../components/global-params/ADSRSection";
import { useState } from 'react'
import { MasterPanel } from "../components/global-params/MasterPanel";
import { FilterPanel } from "../components/global-params/FilterPanel";
import { EffectsPanel } from "../components/global-params/EffectsPanel";
import { LFO1Panel } from "../components/global-params/LFO1Panel";
import { LFO2Panel } from "../components/global-params/LFO2Panel";
 
type TabId = 'master' | 'filter' | 'effects' | 'lfo1' | 'lfo2';

interface Tab {
  id: TabId;
  name: string;
}

const TABS: Tab[] = [
  { id: 'master', name: 'Master' },
  { id: 'filter', name: 'Filter' },
  { id: 'effects', name: 'Effects' },
  { id: 'lfo1', name: 'LFO 1' },
  { id: 'lfo2', name: 'LFO 2' },
];


export function GlobalControlPanel() {
  const [activeTab, setActiveTab] = useState<TabId>('filter')
  return (
    <div style={{
      width: '1000px',
      height: '220px',
      display: 'flex',
      borderRadius: '12px',
      border: '1px solid #2a2a2a',
      background: '#141414',
    }}>

      {/* ADSR Section */}
      <div style={{
        flex: '0 0 400px',
        borderRight: '1px solid #2a2a2a'
      }}>
        <ADSRSection />
      </div>

      {/* Tabbed Section - To be implemented */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{display: 'flex', flexDirection: 'row'}}>
             {TABS.map((tab) => (
            <button style={{ color: 'white', cursor: 'pointer', backgroundColor: activeTab === tab.id ? "green" : "transparent", width: '100%', height: '24px'}} onClick={() => setActiveTab(tab.id)} key={tab.id}>{tab.name}</button>
          ))}
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          minWidth: 0,
          color: '#555',
          fontSize: '11px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>

          {activeTab === 'master' && <MasterPanel/>}
{activeTab === 'filter' && <FilterPanel/>}
{activeTab === 'effects' && <EffectsPanel/>}
{activeTab === 'lfo1' && <LFO1Panel/>}
{activeTab === 'lfo2' && <LFO2Panel/>}

        </div>
      </div>

    </div>
  );
}


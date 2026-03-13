import { ADSRSection } from "../components/global-params/ADSRSection";
import { colors } from '../tokens';
import { FilterPanel } from './FilterPanel';
import { TabPanel } from "./TabPanel";

export function GlobalControlPanel() {
  return (
    <div style={{
      width: '1200px',
      height: '270px',
      display: 'flex',
      background: colors.bg.panel,
      userSelect: 'none',
      WebkitUserSelect: 'none',
      boxSizing: 'border-box',
    }}>

      {/* ADSR Section */}
      <div style={{
        flex: '0 0 304px',
        height: '100%',
        borderRight: '1px solid #2a2a2a'
      }}>
        <ADSRSection />
      </div>

      {/* Test slider */}
      <div style={{ flex: 1, display: 'flex' }}>
        <TabPanel/>
      </div>

    </div>
  );
}


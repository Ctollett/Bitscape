import { ADSRSection } from "../components/global-params/ADSRSection";
import { MasterControls } from "../components/global-params/MasterControls";
import { colors } from '../tokens';
import { FilterPanel } from './FilterPanel';

export function GlobalControlPanel() {
  return (
    <div style={{
      width: '1200px',
      height: '255px',
      display: 'flex',
      background: colors.bg.panel,
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>

      {/* ADSR Section */}
      <div style={{
        flex: '0 0 400px',
        borderRight: '1px solid #2a2a2a'
      }}>
        <MasterControls />
      </div>

      {/* Test slider */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <FilterPanel />
      </div>

    </div>
  );
}


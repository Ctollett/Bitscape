import { usePatch } from "../../fm-canvas/patch-context";
import { EnvelopeEditor } from "./EnvelopeEditor";

const FILTER_TYPES = [
  { value: 0, label: 'LP' },
  { value: 1, label: 'HP' },
];

export function FilterPanel() {
  const { patch, dispatch } = usePatch();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '32px',
      padding: '12px 24px',
    }}>

      {/* Filter Type Toggle */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Type</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {FILTER_TYPES.map(ft => (
            <button
              key={ft.value}
              onClick={() => dispatch({ type: 'SET_FILTER_TYPE', value: ft.value })}
              style={{
                padding: '6px 12px',
                background: patch.filterType === ft.value ? '#4a9eff' : 'transparent',
                border: '1px solid',
                borderColor: patch.filterType === ft.value ? '#4a9eff' : '#333',
                borderRadius: '4px',
                color: patch.filterType === ft.value ? '#fff' : '#555',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {ft.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cutoff */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Cutoff</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{patch.filterCutoff}</span>
        </div>
        <input
          type="range" min={0} max={127} step={1}
          value={patch.filterCutoff}
          onChange={e => dispatch({ type: 'SET_FILTER_CUTOFF', value: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Resonance */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Resonance</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{patch.filterResonance}</span>
        </div>
        <input
          type="range" min={0} max={127} step={1}
          value={patch.filterResonance}
          onChange={e => dispatch({ type: 'SET_FILTER_RESONANCE', value: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Env Amount */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Env Amt</span>
          <span style={{ fontSize: '10px', color: '#4a9eff' }}>{patch.filterEnvAmount}</span>
        </div>
        <input
          type="range" min={0} max={127} step={1}
          value={patch.filterEnvAmount}
          onChange={e => dispatch({ type: 'SET_FILTER_ENV_AMOUNT', value: Number(e.target.value) })}
          style={{ width: '100%', accentColor: '#4a9eff' }}
        />
      </div>

      {/* Filter Envelope */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px' }}>Filter Envelope</span>
        <EnvelopeEditor
          attack={patch.filterEnvAttack}
          decay={patch.filterEnvDecay}
          sustain={patch.filterEnvSustain}
          release={patch.filterEnvRelease}
          onChange={({ attack, decay, sustain, release }) =>
            dispatch({ type: 'SET_FILTER_ENV', attack, decay, sustain, release })
          }
          width={220}
          height={100}
        />
      </div>

    </div>
  );
}


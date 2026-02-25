import { usePatch } from "../../fm-canvas/patch-context";
import { Knob } from "../Knob";
import { VerticalSlider } from "../VerticalSlider";

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
      gap: '24px',
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

      <VerticalSlider label="Cutoff" value={patch.filterCutoff} displayValue={patch.filterCutoff.toString()}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_CUTOFF', value: v })}
      />

      <VerticalSlider label="Resonance" value={patch.filterResonance} displayValue={patch.filterResonance.toString()}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_RESONANCE', value: v })}
      />

      <Knob label="Env Amt" value={patch.filterEnvAmount} displayValue={patch.filterEnvAmount.toString()}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_ENV_AMOUNT', value: v })}
      />

      <Knob label="Attack" value={patch.filterEnvAttack} displayValue={patch.filterEnvAttack.toString()}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_ENV', attack: v, decay: patch.filterEnvDecay, sustain: patch.filterEnvSustain, release: patch.filterEnvRelease })}
      />

      <Knob label="Decay" value={patch.filterEnvDecay} displayValue={patch.filterEnvDecay.toString()}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_ENV', attack: patch.filterEnvAttack, decay: v, sustain: patch.filterEnvSustain, release: patch.filterEnvRelease })}
      />

    </div>
  );
}

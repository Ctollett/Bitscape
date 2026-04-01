import { usePatch } from './patch-context';
import { PanelSlider } from '../components/PanelSlider';

export function FilterMainSliders() {
  const { patch, dispatch } = usePatch();

  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
      <PanelSlider
        value={patch.filterCutoff / 127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_CUTOFF', value: v * 127 })}
        label="Cutoff"
      />
      <PanelSlider
        value={patch.filterResonance / 127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_RESONANCE', value: v * 127 })}
        label="Resonance"
      />
    </div>
  );
}

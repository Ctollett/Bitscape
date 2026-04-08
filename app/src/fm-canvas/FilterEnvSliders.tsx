import { usePatch } from './patch-context';
import { PanelSlider } from '../components/PanelSlider';
import {colors} from '../tokens'

export function FilterEnvSliders() {
  const { patch, dispatch } = usePatch();

  const setFilterEnv = (overrides: Partial<{ attack: number; decay: number; sustain: number; release: number }>) => {
    dispatch({
      type: 'SET_FILTER_ENV',
      attack: patch.filterEnvAttack,
      decay: patch.filterEnvDecay,
      sustain: patch.filterEnvSustain,
      release: patch.filterEnvRelease,
      ...overrides,
    });
  };

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
      <PanelSlider
        color= {colors.section.filter}
        value={patch.filterEnvAmount / 127}
        onChange={(v) => dispatch({ type: 'SET_FILTER_ENV_AMOUNT', value: v * 127 })}
        label="Env"
      />
      <PanelSlider
        color= {colors.section.filter}
        value={patch.filterEnvAttack / 127}
        onChange={(v) => setFilterEnv({ attack: v * 127 })}
        label="Attack"
      />
      <PanelSlider
        color= {colors.section.filter}
        value={patch.filterEnvRelease / 127}
        onChange={(v) => setFilterEnv({ release: v * 127 })}
        label="End"
      />
    </div>
  );
}

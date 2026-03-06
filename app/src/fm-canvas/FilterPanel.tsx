import { usePatch } from './patch-context';
import { FilterSelect } from './FilterSelect';
import { FilterMainSliders } from './FilterMainSliders';
import { FilterEnvSliders } from './FilterEnvSliders';
import { FilterKnobs } from './FilterKnobs';
import type { FilterType } from '../components/FilterShape';

const TYPE_TO_NUM: Record<FilterType, number> = { lp: 0, hp: 1, bp: 2 };
const NUM_TO_TYPE: FilterType[] = ['lp', 'hp', 'bp'];

export function FilterPanel() {
  const { patch, dispatch } = usePatch();

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 24, alignItems: 'center' }}>
      <FilterSelect
        type={NUM_TO_TYPE[patch.filterType] ?? 'lp'}
        cutoff={patch.filterCutoff / 127}
        resonance={patch.filterResonance / 127}
        onTypeChange={(t) => dispatch({ type: 'SET_FILTER_TYPE', value: TYPE_TO_NUM[t] })}
        onCutoffChange={(v) => dispatch({ type: 'SET_FILTER_CUTOFF', value: v * 127 })}
        onResonanceChange={(v) => dispatch({ type: 'SET_FILTER_RESONANCE', value: v * 127 })}
      />
      <FilterMainSliders />
      <FilterEnvSliders />
      <FilterKnobs />
    </div>
  );
}

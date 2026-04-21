import { usePatch } from './patch-context';
import { FilterSelect } from './FilterSelect';
import { FilterEnvSliders } from './FilterEnvSliders';
import { FilterKnobs } from './FilterKnobs';
import type { FilterType } from '../components/FilterShape';
import { colors } from '../tokens';
import { Panel } from '../components/Panel';

const TYPE_TO_NUM: Record<FilterType, number> = { lp: 0, hp: 1, bp: 2 };
const NUM_TO_TYPE: FilterType[] = ['lp', 'hp', 'bp'];

export function FilterPanel() {
  const { patch, dispatch } = usePatch();

  return (
    <Panel spread>
      <FilterSelect
        type={NUM_TO_TYPE[patch.filterType] ?? 'lp'}
        cutoff={patch.filterCutoff / 127}
        resonance={patch.filterResonance / 127}
        onTypeChange={(t) => dispatch({ type: 'SET_FILTER_TYPE', value: TYPE_TO_NUM[t] })}
        onCutoffChange={(v) => dispatch({ type: 'SET_FILTER_CUTOFF', value: v * 127 })}
        onResonanceChange={(v) => dispatch({ type: 'SET_FILTER_RESONANCE', value: v * 127 })}
      />
      <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.border.subtle }} />
      <FilterEnvSliders />
      <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.border.subtle }} />
      <FilterKnobs />
    </Panel>
  );
}

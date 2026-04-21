import { FilterShape } from '../components/FilterShape';
import type { FilterType } from '../components/FilterShape';
import { TabSelect } from '../components/TabSelect';
import { PanelGroup } from '../components/PanelGroup';

const FILTER_TYPES = [
  { value: 0, label: 'LP' },
  { value: 1, label: 'HP' },
  { value: 2, label: 'BP' },
];

const TYPE_TO_NUM: Record<FilterType, number> = { lp: 0, hp: 1, bp: 2 };
const NUM_TO_TYPE: FilterType[] = ['lp', 'hp', 'bp'];

interface FilterSelectProps {
  type: FilterType;
  cutoff: number;
  resonance: number;
  onTypeChange: (type: FilterType) => void;
  onCutoffChange: (value: number) => void;
  onResonanceChange: (value: number) => void;
}

export function FilterSelect({ type, cutoff, resonance, onTypeChange, onCutoffChange, onResonanceChange }: FilterSelectProps) {
  return (
    <PanelGroup>
      <TabSelect
        options={FILTER_TYPES}
        value={TYPE_TO_NUM[type]}
        onChange={(v) => onTypeChange(NUM_TO_TYPE[v])}
      />
      <FilterShape type={type} cutoff={cutoff} resonance={resonance} onCutOffChange={onCutoffChange} onResonanceChange={onResonanceChange} />
    </PanelGroup>
  );
}

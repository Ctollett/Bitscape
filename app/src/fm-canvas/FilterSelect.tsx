import { OptionMenu } from './WaveMenu';
import { FilterShape } from '../components/FilterShape';
import type { FilterType } from '../components/FilterShape';
import { colors } from '../tokens';

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'lp', label: 'LP' },
  { id: 'hp', label: 'HP' },
  { id: 'bp', label: 'BP' },
];

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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <OptionMenu options={FILTER_OPTIONS} value={type} onChange={onTypeChange} color={colors.text.primary} />
      <FilterShape type={type} cutoff={cutoff} resonance={resonance} onCutOffChange={onCutoffChange} onResonanceChange={onResonanceChange} />
    </div>
  );
}

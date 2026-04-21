import { colors, typography, spacing } from '../tokens';

interface TabOption {
  value: number;
  label: string;
}

interface TabSelectProps {
  options: TabOption[];
  value: number;
  onChange: (value: number) => void;
}

export function TabSelect({ options, value, onChange }: TabSelectProps) {
  return (
    <div style={{ display: 'flex', gap: spacing.md }}>
      {options.map(opt => (
        <span
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            ...typography.label.sm,
            color: value === opt.value ? colors.text.primary : colors.text.muted,
            cursor: 'pointer',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          {opt.label}
        </span>
      ))}
    </div>
  );
}

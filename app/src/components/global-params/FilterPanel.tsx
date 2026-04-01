import { usePatch } from "../../fm-canvas/patch-context";
import { VerticalSlider } from "../VerticalSlider";
import { FilterShape } from "../FilterShape";
import type { FilterType } from "../FilterShape";
import { colors, typography, panel, spacing } from "../../tokens";

const FILTER_TYPES = [
  { value: 0, label: 'LP', id: 'lp' as FilterType },
  { value: 1, label: 'HP', id: 'hp' as FilterType },
  { value: 2, label: 'BP', id: 'bp' as FilterType },
];

const NUM_TO_TYPE: FilterType[] = ['lp', 'hp', 'bp'];

export function FilterPanel() {
  const { patch, dispatch } = usePatch();
  const filterType = NUM_TO_TYPE[patch.filterType] ?? 'lp';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      padding: `${panel.padding.y}px ${panel.padding.x}px`,
      gap: panel.gap.control,
    }}>

      {/* Type toggle + filter curve */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm, alignSelf: 'center' }}>
        <div style={{ display: 'flex', gap: spacing.md }}>
          {FILTER_TYPES.map(ft => {
            const isActive = patch.filterType === ft.value;
            return (
              <span
                key={ft.value}
                onClick={() => dispatch({ type: 'SET_FILTER_TYPE', value: ft.value })}
                style={{
                  ...typography.label.sm,
                  color: isActive ? colors.text.primary : colors.text.muted,
                  cursor: 'pointer',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                {ft.label}
              </span>
            );
          })}
        </div>
        <FilterShape
          type={filterType}
          cutoff={patch.filterCutoff / 127}
          resonance={patch.filterResonance / 127}
          onCutOffChange={(v) => dispatch({ type: 'SET_FILTER_CUTOFF', value: Math.round(v * 127) })}
          onResonanceChange={(v) => dispatch({ type: 'SET_FILTER_RESONANCE', value: Math.round(v * 127) })}
        />
      </div>

      {/* Divider */}
      <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.border.subtle }} />

      {/* Cutoff + Resonance */}
      <VerticalSlider label="Cutoff" value={patch.filterCutoff} min={0} max={127}
        color={colors.bg.canvas}
        onChange={(v) => dispatch({ type: 'SET_FILTER_CUTOFF', value: v })}
      />
      <VerticalSlider label="Resonance" value={patch.filterResonance} min={0} max={127}
        color={colors.bg.canvas}
        onChange={(v) => dispatch({ type: 'SET_FILTER_RESONANCE', value: v })}
      />

      {/* Divider */}
      <div style={{ width: 1, alignSelf: 'stretch', backgroundColor: colors.border.subtle }} />

      {/* Envelope sliders */}
      <VerticalSlider label="Env" value={patch.filterEnvAmount} min={0} max={127}
        color={colors.bg.canvas}
        onChange={(v) => dispatch({ type: 'SET_FILTER_ENV_AMOUNT', value: v })}
      />
      <VerticalSlider label="Attack" value={patch.filterEnvAttack} min={0} max={127}
        color={colors.bg.canvas}
        onChange={(v) => dispatch({ type: 'SET_FILTER_ENV', attack: v, decay: patch.filterEnvDecay, sustain: patch.filterEnvSustain, release: patch.filterEnvRelease })}
      />
      <VerticalSlider label="End" value={patch.filterEnvDecay} min={0} max={127}
        color={colors.bg.canvas}
        onChange={(v) => dispatch({ type: 'SET_FILTER_ENV', attack: patch.filterEnvAttack, decay: v, sustain: patch.filterEnvSustain, release: patch.filterEnvRelease })}
      />


    </div>
  );
}

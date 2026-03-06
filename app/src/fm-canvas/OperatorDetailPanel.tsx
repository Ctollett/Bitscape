import type { CSSProperties } from 'react';
import { usePatch } from './patch-context';
import { OPERATOR_LABELS, OPERATOR_COLORS, RATIO_SNAPS } from './constants';
import { Knob } from '../components/Knob';
import { SteppedKnob } from '../components/SteppedKnob';
import { VerticalSlider } from '../components/VerticalSlider';
import { spacing } from '../tokens'
import { WaveMenu } from './WaveMenu';



const KNOB_ROW: CSSProperties = {
  display:        'flex',
  flexDirection:  'row',
  alignItems:     'flex-start',
  justifyContent: 'flex-start',
  gap:            spacing.md,
  width:          '100%',
};


interface OperatorDetailPanelProps {
  opIndex: number;
  onClose: () => void;
}

export function OperatorDetailPanel({ opIndex, onClose: _onClose }: OperatorDetailPanelProps) {
  const { patch, dispatch } = usePatch();
  const op       = patch.operators[opIndex];
  const feedback = patch.operatorFeedback[opIndex];
  const detune   = patch.operatorDetune[opIndex];
  const harm     = patch.operatorHarm[opIndex];
  const level    = patch.operatorLevel[opIndex];
  const env      = patch.operatorModEnv[opIndex];

  const updateEnv = (field: string, val: number) =>
    dispatch({ type: 'SET_OPERATOR_MOD_ENV', opIndex,
      attack: env.attack, decay: env.decay, end: env.end, [field]: val });

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'flex-start',
        gap:           spacing.xl,
        position:      'absolute',
        top:           20,
        left:          20,
        padding:       '12px 14px',
        borderRadius:  8,
        minWidth:      200,
      }}
    >
      {/* Header */}
      <span style={{ fontSize: 11, fontWeight: 600, color: OPERATOR_COLORS[opIndex], letterSpacing: '0.08em', alignSelf: 'flex-start' }}>
        {OPERATOR_LABELS[opIndex]}
      </span>

    <WaveMenu value={patch.operatorWaveforms[opIndex]}
onChange={(w) => dispatch({ type: 'SET_WAVEFORM', opIndex, waveform: w })} color={OPERATOR_COLORS[opIndex]} />
      {/* Row 1 — Ratio (stepped) + Waveform picker */}
      <div style={{ display: 'flex', alignItems: 'stretch', gap: spacing.lg }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SteppedKnob
            value={op.ratio}
            steps={RATIO_SNAPS}
            onChange={(v) => dispatch({ type: 'SET_RATIO', opIndex, ratio: v })}
            label="Ratio"
            width={132}
            height={114}
            displayValue={`${op.ratio}x`}
            color={OPERATOR_COLORS[opIndex]}
          />
        </div>
        <VerticalSlider label="Level" value={level} displayValue={level.toString()}
          min={0} max={127}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_LEVEL', opIndex, value: v })}
          color={OPERATOR_COLORS[opIndex]}
        />
      </div>


      {/* Row 3 — Output: Level + Feedback */}
      <div style={{display: 'flex', gap: spacing.md, flexDirection: 'column'}}>
      <div style={KNOB_ROW}>
        <Knob
          value={feedback}
          min={0} max={127}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_FEEDBACK', opIndex, value: v })}
          label="Fdbk"
          color={OPERATOR_COLORS[opIndex]}
        />
        <Knob
          value={detune}
          min={-100} max={100}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_DETUNE', opIndex, value: v })}
          label="Detune"
          displayValue={`${detune > 0 ? '+' : ''}${detune}¢`}
          color={OPERATOR_COLORS[opIndex]}
        />
        <Knob
          value={harm}
          min={-26} max={26}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_HARM', opIndex, value: v })}
          label="Harm"
          displayValue={`${harm > 0 ? '+' : ''}${harm}`}
          color={OPERATOR_COLORS[opIndex]}
        />
      </div>


      {/* Row 4 — Mod Env: Attack + Decay + End */}
      <div style={KNOB_ROW}>
        <Knob
          value={env.attack}
          min={0} max={127}
          onChange={(v) => updateEnv('attack', v)}
          label="Atk"
          color={OPERATOR_COLORS[opIndex]}
        />
        <Knob
          value={env.decay}
          min={0} max={127}
          onChange={(v) => updateEnv('decay', v)}
          label="Dec"
          color={OPERATOR_COLORS[opIndex]}
        />
        <Knob
          value={env.end}
          min={0} max={127}
          onChange={(v) => updateEnv('end', v)}
          label="End"
          color={OPERATOR_COLORS[opIndex]}
        />
      </div>
      </div>
    </div>
  );
}

import type { CSSProperties } from 'react';
import { usePatch } from './patch-context';
import { OPERATOR_LABELS, OPERATOR_COLORS, RATIO_SNAPS } from './constants';
import { PanelKnob } from '../components/PanelKnob';
import { SteppedKnob } from '../components/SteppedKnob';
import { PanelSlider } from '../components/PanelSlider';
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
        <PanelSlider
          label="Level"
          value={level / 127}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_LEVEL', opIndex, value: Math.round(v * 127) })}
        />
      </div>


      {/* Row 3 — Output: Level + Feedback */}
      <div style={{display: 'flex', gap: spacing.md, flexDirection: 'column'}}>
      <div style={KNOB_ROW}>
        <PanelKnob
          value={feedback / 127}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_FEEDBACK', opIndex, value: Math.round(v * 127) })}
          label="Fdbk"
        />
        <PanelKnob
          value={(detune + 100) / 200}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_DETUNE', opIndex, value: Math.round(v * 200 - 100) })}
          label="Detune"
        />
        <PanelKnob
          value={(harm + 26) / 52}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_HARM', opIndex, value: Math.round(v * 52 - 26) })}
          label="Harm"
        />
      </div>

      {/* Row 4 — Mod Env: Attack + Decay + End */}
      <div style={KNOB_ROW}>
        <PanelKnob
          value={env.attack / 127}
          onChange={(v) => updateEnv('attack', Math.round(v * 127))}
          label="Atk"
        />
        <PanelKnob
          value={env.decay / 127}
          onChange={(v) => updateEnv('decay', Math.round(v * 127))}
          label="Dec"
        />
        <PanelKnob
          value={env.end / 127}
          onChange={(v) => updateEnv('end', Math.round(v * 127))}
          label="End"
        />
      </div>
      </div>
    </div>
  );
}

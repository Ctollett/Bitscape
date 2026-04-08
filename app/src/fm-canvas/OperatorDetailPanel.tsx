import type { CSSProperties } from 'react';
import { usePatch } from './patch-context';
import { OPERATOR_LABELS, OPERATOR_COLORS, RATIO_SNAPS } from './constants';
import { PanelKnob } from '../components/PanelKnob';
import { SteppedKnob } from '../components/SteppedKnob';
import { PanelSlider } from '../components/PanelSlider';
import { spacing, colors } from '../tokens'
import OperatorALogo from '../assets/svgs/operatorA-logo.svg?react'
import OperatorBLogo from '../assets/svgs/OperatorB-logo.svg?react'
import OperatorCLogo from '../assets/svgs/OperatorC-logo.svg?react'
import OperatorDLogo from '../assets/svgs/OperatorD-logo.svg?react'
import { WaveMenu } from './WaveMenu';



const KNOB_ROW: CSSProperties = {
  display:        'flex',
  flexDirection:  'row',
  alignItems:     'flex-start',
  justifyContent: 'space-between',
  width:          200,
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
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
        <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {opIndex === 1 ? <OperatorBLogo width={24} height={20} /> : opIndex === 2 ? <OperatorCLogo width={14} height={24} /> : opIndex === 3 ? <OperatorDLogo width={20} height={24} /> : <OperatorALogo width={24} height={20} />}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color: OPERATOR_COLORS[opIndex], letterSpacing: '0.08em' }}>
          {OPERATOR_LABELS[opIndex]}
        </span>
        </div>

    <WaveMenu value={patch.operatorWaveforms[opIndex]}
onChange={(w) => dispatch({ type: 'SET_WAVEFORM', opIndex, waveform: w })} color={OPERATOR_COLORS[opIndex]} />
      {/* Row 1 — Ratio (stepped) + Waveform picker */}
      <div style={{ display: 'flex', alignItems: 'stretch', width: 200, justifyContent: 'flex-start', gap: 40 }}>
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
          color={OPERATOR_COLORS[opIndex]}
        />
      </div>


      {/* Row 3 — Output: Level + Feedback */}
      <div style={{display: 'flex', gap: spacing.md, flexDirection: 'column'}}>
      <div style={KNOB_ROW}>
        <PanelKnob trackColor={colors.bg.overlay} color={OPERATOR_COLORS[opIndex]}
          value={feedback / 127}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_FEEDBACK', opIndex, value: Math.round(v * 127) })}
          label="Fdbk"
        />
        <PanelKnob trackColor={colors.bg.overlay} color={OPERATOR_COLORS[opIndex]}
          value={(detune + 100) / 200}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_DETUNE', opIndex, value: Math.round(v * 200 - 100) })}
          label="Detune"
        />
        <PanelKnob trackColor={colors.bg.overlay} color={OPERATOR_COLORS[opIndex]}
          value={(harm + 26) / 52}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_HARM', opIndex, value: Math.round(v * 52 - 26) })}
          label="Harm"
        />
      </div>

      {/* Row 4 — Mod Env: Attack + Decay + End */}
      <div style={KNOB_ROW}>
        <PanelKnob trackColor={colors.bg.overlay} color={OPERATOR_COLORS[opIndex]}
          value={env.attack / 127}
          onChange={(v) => updateEnv('attack', Math.round(v * 127))}
          label="Atk"
        />
        <PanelKnob trackColor={colors.bg.overlay} color={OPERATOR_COLORS[opIndex]}
          value={env.decay / 127}
          onChange={(v) => updateEnv('decay', Math.round(v * 127))}
          label="Dec"
        />
        <PanelKnob trackColor={colors.bg.overlay} color={OPERATOR_COLORS[opIndex]}
          value={env.end / 127}
          onChange={(v) => updateEnv('end', Math.round(v * 127))}
          label="End"
        />
      </div>
      </div>
    </div>
  );
}

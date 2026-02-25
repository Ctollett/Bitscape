import type { ReactElement, CSSProperties } from 'react';
import { usePatch } from './patch-context';
import { OPERATOR_LABELS, OPERATOR_COLORS, RATIO_SNAPS } from './constants';
import type { WaveTypeId } from './types';
import { Knob } from '../components/Knob';
import { SteppedKnob } from '../components/SteppedKnob';


// ─── Waveform icon paths (SVG, 20×14 viewBox) ────────────────────────────────
const WAVE_ICONS: Record<number, ReactElement> = {
  // Sine
  0: <path d="M1 7 C4 1, 6 1, 10 7 S16 13, 19 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>,
  // Triangle
  1: <polyline points="1,13 5,1 10,13 15,1 19,13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
  // Square
  2: <polyline points="1,13 1,1 10,1 10,13 19,13 19,1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
  // Sawtooth
  3: <polyline points="1,13 10,1 10,13 19,1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
  // Noise
  4: <polyline points="1,7 3,3 5,11 7,5 9,9 11,3 13,11 15,6 17,9 19,7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
};

const KNOB_ROW: CSSProperties = {
  display:        'flex',
  flexDirection:  'row',
  alignItems:     'flex-start',
  justifyContent: 'flex-start',
  gap:            16,
  width:          '100%',
};

const DIVIDER: CSSProperties = {
  width:           '100%',
  height:          1,
  background:      '#222',
  margin:          '2px 0',
};

interface OperatorDetailPanelProps {
  opIndex: number;
  onClose: () => void;
}

export function OperatorDetailPanel({ opIndex, onClose: _onClose }: OperatorDetailPanelProps) {
  const { patch, dispatch } = usePatch();
  const op       = patch.operators[opIndex];
  const waveform = patch.operatorWaveforms[opIndex];
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
        gap:           10,
        position:      'absolute',
        top:           20,
        left:          20,
        padding:       '12px 14px',
        border:        '1px solid #2a2a2a',
        borderRadius:  8,
        minWidth:      200,
      }}
    >
      {/* Header */}
      <span style={{ fontSize: 11, fontWeight: 600, color: OPERATOR_COLORS[opIndex], letterSpacing: '0.08em', alignSelf: 'flex-start' }}>
        {OPERATOR_LABELS[opIndex]}
      </span>

      <div style={DIVIDER} />

      {/* Row 1 — Ratio (stepped) + Waveform picker */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'flex-start' }}>
        <SteppedKnob
          value={op.ratio}
          steps={RATIO_SNAPS}
          onChange={(v) => dispatch({ type: 'SET_RATIO', opIndex, ratio: v })}
          label="Ratio"
          size={52}
          displayValue={`${op.ratio}x`}
        />

        {/* Waveform icon picker */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {([0, 1, 2, 3, 4] as WaveTypeId[]).map((w) => (
              <button
                key={w}
                onClick={() => dispatch({ type: 'SET_WAVEFORM', opIndex, waveform: w })}
                style={{
                  width:        28,
                  height:       22,
                  padding:      0,
                  background:   waveform === w ? '#2e2e2e' : 'transparent',
                  border:       `1px solid ${waveform === w ? '#505050' : '#242424'}`,
                  borderRadius: 4,
                  cursor:       'pointer',
                  color:        waveform === w ? '#ccc' : '#484848',
                  display:      'flex',
                  alignItems:   'center',
                  justifyContent: 'center',
                }}
              >
                <svg width={20} height={14} viewBox="0 0 20 14">
                  {WAVE_ICONS[w]}
                </svg>
              </button>
            ))}
          </div>
          <span style={{ fontSize: 9, color: '#444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Wave</span>
        </div>
      </div>

      <div style={DIVIDER} />

      {/* Row 2 — Tuning: Detune + Harm */}
      <div style={KNOB_ROW}>
        <Knob
          value={detune}
          min={-100} max={100}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_DETUNE', opIndex, value: v })}
          label="Detune"
          size={36}
          displayValue={`${detune > 0 ? '+' : ''}${detune}¢`}
        />
        <Knob
          value={harm}
          min={-26} max={26}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_HARM', opIndex, value: v })}
          label="Harm"
          size={36}
          displayValue={`${harm > 0 ? '+' : ''}${harm}`}
        />
      </div>

      <div style={DIVIDER} />

      {/* Row 3 — Output: Level + Feedback */}
      <div style={KNOB_ROW}>
        <Knob
          value={level}
          min={0} max={127}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_LEVEL', opIndex, value: v })}
          label="Level"
          size={36}
        />
        <Knob
          value={feedback}
          min={0} max={127}
          onChange={(v) => dispatch({ type: 'SET_OPERATOR_FEEDBACK', opIndex, value: v })}
          label="Fdbk"
          size={36}
        />
      </div>

      <div style={DIVIDER} />

      {/* Row 4 — Mod Env: Attack + Decay + End */}
      <div style={KNOB_ROW}>
        <Knob
          value={env.attack}
          min={0} max={127}
          onChange={(v) => updateEnv('attack', v)}
          label="Atk"
          size={36}
        />
        <Knob
          value={env.decay}
          min={0} max={127}
          onChange={(v) => updateEnv('decay', v)}
          label="Dec"
          size={36}
        />
        <Knob
          value={env.end}
          min={0} max={127}
          onChange={(v) => updateEnv('end', v)}
          label="End"
          size={36}
        />
      </div>
    </div>
  );
}

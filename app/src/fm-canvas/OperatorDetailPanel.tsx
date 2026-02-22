import { usePatch } from './patch-context';
import { OPERATOR_LABELS, OPERATOR_COLORS, RATIO_SNAPS, WAVEFORM_NAMES } from './constants';
import type { WaveTypeId } from './types';

interface OperatorDetailPanelProps {
  opIndex: number;
  onClose: () => void;
}

export function OperatorDetailPanel({ opIndex, onClose: _onClose }: OperatorDetailPanelProps) {
  const { patch, dispatch } = usePatch();
  const op = patch.operators[opIndex];
  const waveform = patch.operatorWaveforms[opIndex];
  const feedback = patch.operatorFeedback[opIndex];
  const detune = patch.operatorDetune[opIndex];
  const harm = patch.operatorHarm[opIndex];
  const level = patch.operatorLevel[opIndex];

  return (
    <div onPointerDown={(e) => e.stopPropagation()} className='' style={{display:'flex', flexDirection: 'column', gap: '8px', position: 'absolute', top: '20px',
left: '20px'}}>
      <span style={{ color: OPERATOR_COLORS[opIndex] }}>{OPERATOR_LABELS[opIndex]}</span>
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ fontSize: 11, color: '#888', width: '60px' }}>Ratio</span>
  <input type='range' min={0} max={RATIO_SNAPS.length - 1} value={RATIO_SNAPS.indexOf(op.ratio)} onChange={(e) => dispatch({type: 'SET_RATIO', opIndex, ratio: RATIO_SNAPS[+e.target.value]})} style={{ flex: 1 }} />
  <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{op.ratio}x</span>
</div>
<span style={{cursor: 'pointer'}}
onClick={() => dispatch({
  type: 'SET_WAVEFORM',
  opIndex,
  waveform: ((waveform + 1) % 5) as WaveTypeId
})}
>
  {WAVEFORM_NAMES[waveform]}
</span>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ fontSize: 11, color: '#888', width: '60px' }}>Feedback</span>
  <input type='range' min={0} max={127} step={1} value={feedback} onChange={(e) => dispatch({type: 'SET_OPERATOR_FEEDBACK', opIndex, value: +e.target.value})} style={{ flex: 1 }} />
  <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{feedback}</span>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ fontSize: 11, color: '#888', width: '60px' }}>Detune</span>
  <input type='range' min={-100} max={100} step={1} value={detune} onChange={(e) => dispatch({type: 'SET_OPERATOR_DETUNE', opIndex, value: +e.target.value})} style={{ flex: 1 }} />
  <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{detune > 0 ? '+' : ''}{detune}¢</span>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ fontSize: 11, color: '#888', width: '60px' }}>Harm</span>
  <input type='range' min={-26} max={26} step={1} value={harm} onChange={(e) => dispatch({type: 'SET_OPERATOR_HARM', opIndex, value: +e.target.value})} style={{ flex: 1 }} />
  <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{harm > 0 ? '+' : ''}{harm}</span>
</div>

<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
  <span style={{ fontSize: 11, color: '#888', width: '60px' }}>Level</span>
  <input type='range' min={0} max={127} step={1} value={level} onChange={(e) => dispatch({type: 'SET_OPERATOR_LEVEL', opIndex, value: +e.target.value})} style={{ flex: 1 }} />
  <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{level}</span>
</div>

{/* Mod Envelope (ADE) — per operator */}
{(() => {
  const env = patch.operatorModEnv[opIndex];
  const update = (field: string, value: number) =>
    dispatch({ type: 'SET_OPERATOR_MOD_ENV', opIndex, attack: env.attack, decay: env.decay, end: env.end, [field]: value });
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 11, color: '#888', width: '60px' }}>Attack</span>
        <input type="range" min={0} max={127} step={1} value={env.attack} onChange={(e) => update('attack', +e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{env.attack}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 11, color: '#888', width: '60px' }}>Decay</span>
        <input type="range" min={0} max={127} step={1} value={env.decay} onChange={(e) => update('decay', +e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{env.decay}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 11, color: '#888', width: '60px' }}>End</span>
        <input type="range" min={0} max={127} step={1} value={env.end} onChange={(e) => update('end', +e.target.value)} style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: '#aaa', width: '40px', textAlign: 'right' }}>{env.end}</span>
      </div>
    </>
  );
})()}

    </div>
  )
}

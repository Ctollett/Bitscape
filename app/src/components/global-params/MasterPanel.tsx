import { usePatch } from '../../fm-canvas/patch-context';

function Slider({ label, value, display, min, max, step, onChange }: {
  label: string; value: number; display: string;
  min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, minWidth: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
        <span style={{ fontSize: '10px', color: '#4a9eff' }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#4a9eff' }}
      />
    </div>
  );
}

export function MasterPanel() {
  const { patch, dispatch } = usePatch();

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center',
      gap: '24px', padding: '12px 24px',
    }}>

      <Slider label="Volume" value={patch.masterVolume} display={patch.masterVolume.toString()}
        min={0} max={127} step={1}
        onChange={v => dispatch({ type: 'SET_MASTER_VOLUME', value: v })}
      />

      <Slider label="Pan" value={patch.masterPan} display={patch.masterPan === 64 ? 'C' : patch.masterPan < 64 ? `L${64 - patch.masterPan}` : `R${patch.masterPan - 64}`}
        min={0} max={127} step={1}
        onChange={v => dispatch({ type: 'SET_MASTER_PAN', value: v })}
      />

      <Slider label="Overdrive" value={patch.masterOverdrive} display={`${Math.round(patch.masterOverdrive * 100)}%`}
        min={0} max={1} step={0.01}
        onChange={v => dispatch({ type: 'SET_MASTER_OVERDRIVE', value: v })}
      />

      <Slider label="Octave" value={patch.octave} display={patch.octave === 0 ? '0' : patch.octave > 0 ? `+${patch.octave}` : `${patch.octave}`}
        min={-2} max={2} step={1}
        onChange={v => dispatch({ type: 'SET_OCTAVE', value: v })}
      />

      <Slider label="Portamento" value={patch.portamentoTime} display={patch.portamentoTime.toString()}
        min={0} max={127} step={1}
        onChange={v => dispatch({ type: 'SET_PORTAMENTO_TIME', value: v })}
      />

      <Slider label="PB Range" value={patch.pitchBendRange} display={`${patch.pitchBendRange} st`}
        min={0} max={24} step={1}
        onChange={v => dispatch({ type: 'SET_PITCH_BEND_RANGE', value: v })}
      />

    </div>
  );
}

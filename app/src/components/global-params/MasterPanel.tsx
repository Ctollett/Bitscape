import { usePatch } from '../../fm-canvas/patch-context';
import { Knob } from '../Knob';


export function MasterPanel() {
  const { patch, dispatch } = usePatch();

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center',
      gap: '24px', padding: '12px 24px',
    }}>

      <Knob label="Volume" value={patch.masterVolume} displayValue={patch.masterVolume.toString()}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_MASTER_VOLUME', value: v })}
      />

      <Knob label="Pan" value={patch.masterPan} displayValue={patch.masterPan === 64 ? 'C' : patch.masterPan < 64 ? `L${64 - patch.masterPan}` : `R${patch.masterPan - 64}`}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_MASTER_PAN', value: v })}
      />

      <Knob label="Overdrive" value={patch.masterOverdrive} displayValue={`${Math.round(patch.masterOverdrive * 100)}%`}
        min={0} max={1}
        onChange={(v) => dispatch({ type: 'SET_MASTER_OVERDRIVE', value: v })}
      />

      <Knob label="Octave" value={patch.octave} displayValue={patch.octave === 0 ? '0' : patch.octave > 0 ? `+${patch.octave}` : `${patch.octave}`}
        min={-2} max={2}
        onChange={(v) => dispatch({ type: 'SET_OCTAVE', value: v })}
      />

      <Knob label="Portamento" value={patch.portamentoTime} displayValue={patch.portamentoTime.toString()}
        min={0} max={127}
        onChange={(v) => dispatch({ type: 'SET_PORTAMENTO_TIME', value: v })}
      />

      <Knob label="PB Range" value={patch.pitchBendRange} displayValue={`${patch.pitchBendRange} st`}
        min={0} max={24}
        onChange={(v) => dispatch({ type: 'SET_PITCH_BEND_RANGE', value: v })}
      />

    </div>
  );
}

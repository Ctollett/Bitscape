import { usePatch } from '../../fm-canvas/patch-context';


export function MasterPanel() {
  const {patch, dispatch} = usePatch();

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ textAlign: 'start', display: 'flex', flexDirection: 'row', gap: '24px', alignItems: 'start', justifyContent: 'start' }}>
        <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', marginBottom: '12px' }}>
          Master Controls
        </div>
        <div style={{ color: '#666', fontSize: '11px', display: 'flex', flexDirection: 'column' }}>
          <p>Volume: {patch.masterVolume}</p>
          <input type='range' min="0" max="127" value={patch.masterVolume} onChange={(e) => dispatch({ type: 'SET_MASTER_VOLUME', value: Number(e.target.value) })} />

          <p style={{ marginTop: '12px' }}>Pan: {patch.masterPan}</p>
          <input type='range' min="0" max="127" value={patch.masterPan} onChange={(e) => dispatch({ type: 'SET_MASTER_PAN', value: Number(e.target.value) })} />
          </div>

          <div>
          <p style={{ marginTop: '12px' }}>Portamento Time: {patch.portamentoTime}</p>
          <input type='range' min="0" max="127" value={patch.portamentoTime} onChange={(e) => dispatch({ type: 'SET_PORTAMENTO_TIME', value: Number(e.target.value) })} />


          <p style={{ marginTop: '12px' }}>Pitch Bend Range: {patch.pitchBendRange} semitones</p>
          <input type='range' min="0" max="24" value={patch.pitchBendRange} onChange={(e) => dispatch({ type: 'SET_PITCH_BEND_RANGE', value: Number(e.target.value) })} />

          <p style={{ marginTop: '12px' }}>Pitch Bend: {patch.pitchBend.toFixed(2)}</p>
          <input type='range' min="-1" max="1" step="0.01" value={patch.pitchBend} onChange={(e) => dispatch({ type: 'SET_PITCH_BEND', value: Number(e.target.value) })} />
          </div>
        </div>
      </div>
  );
}

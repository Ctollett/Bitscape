import { usePatch } from '../../fm-canvas/patch-context';
import { PanelKnob } from '../PanelKnob';

import { spacing } from '../../tokens';


export function MasterPanel() {
  const { patch, dispatch } = usePatch();

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',flexDirection: 'column',
      gap: spacing.md,
    }}>

    <div style={{display: 'flex', flexDirection: 'row', gap: '24px'}}>
      <PanelKnob
        value={patch.masterVolume / 127}
        onChange={(v) => dispatch({ type: 'SET_MASTER_VOLUME', value: v * 127 })}
        label="Vol"
      />

      <PanelKnob
        value={patch.masterPan / 127}
        onChange={(v) => dispatch({ type: 'SET_MASTER_PAN', value: v * 127 })}
        label="Pan"
      />

      <PanelKnob
        value={patch.masterOverdrive}
        onChange={(v) => dispatch({ type: 'SET_MASTER_OVERDRIVE', value: v })}
        label="Drive"
      />
      </div>
 <div style={{display: 'flex', flexDirection: 'row', gap: '24px'}}>
      <PanelKnob
        value={patch.masterVolume / 127}
        onChange={(v) => dispatch({ type: 'SET_MASTER_VOLUME', value: v * 127 })}
        label="Vol"
      />

      <PanelKnob
        value={patch.portamentoTime / 127}
        onChange={(v) => dispatch({ type: 'SET_PORTAMENTO_TIME', value: v * 127 })}
        label="Porta"
      />

      <PanelKnob
        value={patch.pitchBendRange / 24}
        onChange={(v) => dispatch({ type: 'SET_PITCH_BEND_RANGE', value: v * 24 })}
        label="PB"
      />
</div>
    </div>
  );
}

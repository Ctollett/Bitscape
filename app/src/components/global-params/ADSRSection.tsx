import { EnvelopeEditor } from './EnvelopeEditor';
import { usePatch } from '../../fm-canvas/patch-context';

export function ADSRSection() {
  const { patch, dispatch } = usePatch();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', width: '100%' }}>
      <div style={{ fontSize: '11px', color: '#888', textTransform: 'uppercase', height: '24px', display: 'flex', alignItems: 'center', paddingTop: '0' }}>
        Amplitude Envelope
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EnvelopeEditor
          attack={patch.ampAttack}
          decay={patch.ampDecay}
          sustain={patch.ampSustain}
          release={patch.ampRelease}
          onChange={({ attack, decay, sustain, release }) =>
            dispatch({ type: 'SET_AMP_ENV', attack, decay, sustain, release })
          }
          width={300}
          height={120}
        />
      </div>
    </div>
  );
}

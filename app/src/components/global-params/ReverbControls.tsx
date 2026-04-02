import { PanelSlider } from '../PanelSlider';
import { usePatch } from '../../fm-canvas/patch-context';
import { HorizontalSlider } from '../HorizontalSlider';

export function ReverbControls() {
  const { patch, dispatch } = usePatch();

    const update = (partial: Partial<{ enabled: boolean; decay: number; damping: number; mix: number }>) =>
    dispatch({
      type: 'SET_REVERB',
      enabled: patch.reverbEnabled,
      decay: patch.reverbDecay,
      damping: patch.reverbDamping,
      mix: patch.reverbMix,
      ...partial,
    });


  return (
    <div style={{display: 'flex', gap: 16, width: 86, height: 140, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
       <HorizontalSlider value={patch.reverbDecay} onChange={(v) => update({ decay: v })} label="decay" />
       <HorizontalSlider value={patch.reverbDamping} onChange={(v) => update({ damping: v })} label="damping" />
       <HorizontalSlider value={patch.reverbMix} onChange={(v) => update({ mix: v })} label="mix" />
    </div>
  );
}

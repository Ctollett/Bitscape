import { usePatch } from '../../fm-canvas/patch-context';
import { HorizontalSlider } from '../HorizontalSlider';

export function ChorusControls() {
  const { patch, dispatch } = usePatch();

  const update = (partial: Partial<{ depth: number; speed: number; width: number; hpfCutoff: number; delayMs: number; reverbSend: number }>) =>
    dispatch({
      type: 'SET_CHORUS',
      enabled: true,
      depth: patch.chorusDepth,
      speed: patch.chorusSpeed,
      width: patch.chorusWidth,
      hpfCutoff: patch.chorusHpfCutoff,
      delayMs: patch.chorusDelayMs,
      reverbSend: patch.chorusReverbSend,
      ...partial,
    });

  return (
    <div style={{ display: 'flex', gap: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <HorizontalSlider value={patch.chorusDepth} onChange={(v) => update({ depth: v })} label="depth" />
      <HorizontalSlider value={(patch.chorusSpeed - 0.1) / 9.9} onChange={(v) => update({ speed: v * 9.9 + 0.1 })} label="speed" />
      <HorizontalSlider value={patch.chorusWidth} onChange={(v) => update({ width: v })} label="width" />
      <HorizontalSlider value={patch.chorusReverbSend} onChange={(v) => update({ reverbSend: v })} label="reverb" />
    </div>
  );
}

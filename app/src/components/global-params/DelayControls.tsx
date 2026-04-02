import { usePatch } from '../../fm-canvas/patch-context';
import { HorizontalSlider } from '../HorizontalSlider';

export function DelayControls() {
  const { patch, dispatch } = usePatch();

  const update = (partial: Partial<{ ms: number; feedback: number; mix: number }>) =>
    dispatch({
      type: 'SET_DELAY',
      enabled: true,
      ms: patch.delayMs,
      feedback: patch.delayFeedback,
      mix: patch.delayMix,
      ...partial,
    });

  return (
    <div style={{ display: 'flex', gap: 16, flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <HorizontalSlider value={patch.delayMs / 1000} onChange={(v) => update({ ms: v * 1000 })} label="time" />
      <HorizontalSlider value={patch.delayFeedback / 0.99} onChange={(v) => update({ feedback: v * 0.99 })} label="feedback" />
      <HorizontalSlider value={patch.delayMix} onChange={(v) => update({ mix: v })} label="mix" />
    </div>
  );
}

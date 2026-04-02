import { EffectCard } from './EffectCard';
import { DelayDesign } from './DelayDesign';
import { ReverbDesign } from './ReverbDesign';
import { ChorusDesign } from './ChorusDesign'
import Bitcrush from '../../assets/svgs/bitcrush.svg?react'
import { usePatch } from '../../fm-canvas/patch-context';
import { DelayControls } from './DelayControls';
import { ReverbControls } from './ReverbControls';
import { ChorusControls } from './ChorusControls';



export function EffectsPanel() {
  const {patch, dispatch} = usePatch()
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
      <EffectCard label="DELAY" design={<DelayDesign/>} enabled={patch.delayEnabled} onToggle={() => dispatch({ type: 'SET_DELAY', enabled: !patch.delayEnabled, ms: patch.delayMs, feedback: patch.delayFeedback, mix: patch.delayMix })} index={2}><DelayControls /></EffectCard>
      <EffectCard label="REVERB" design={<ReverbDesign/>} enabled={patch.reverbEnabled} onToggle={() => dispatch({ type: 'SET_REVERB', enabled: !patch.reverbEnabled, decay: patch.reverbDecay, damping: patch.reverbDamping, mix: patch.reverbMix })} index={0}><ReverbControls /></EffectCard>
      <EffectCard label="CHORUS" design={<ChorusDesign/>} enabled={patch.chorusEnabled} onToggle={() => dispatch({ type: 'SET_CHORUS', enabled: !patch.chorusEnabled, depth: patch.chorusDepth, speed: patch.chorusSpeed, width: patch.chorusWidth, hpfCutoff: patch.chorusHpfCutoff, delayMs: patch.chorusDelayMs, reverbSend: patch.chorusReverbSend })} index={1}><ChorusControls /></EffectCard>
      <EffectCard label="BITCRUSH" design={<Bitcrush/>} enabled={false} onToggle={() => {}} index={3}>{null}</EffectCard>
    </div>
  );
}

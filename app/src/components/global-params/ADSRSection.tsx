import { PanelKnob } from '../PanelKnob';
import { PanelSlider } from '../PanelSlider';
import { usePatch } from '../../fm-canvas/patch-context';

import { spacing, typography, colors } from '../../tokens'


export function ADSRSection() {

  const { patch, dispatch} = usePatch();

  const setEnv = (overrides: Partial<{ attack: number; decay: number; sustain: number; release: number }>) => {

    dispatch({
      type: 'SET_AMP_ENV',
      attack: patch.ampAttack,
      decay: patch.ampDecay,
      sustain: patch.ampSustain,
      release: patch.ampRelease,
      ...overrides,
    });
  };


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', paddingTop: 24, paddingBottom: 24, paddingLeft: 24, paddingRight: 24, boxSizing: 'border-box' }}>
        <span style={{ ...typography.label.lg, lineHeight: 1, color: colors.text.muted, alignSelf: 'flex-start' }}>ADSR</span>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: spacing.xl, paddingTop: 16 }}>
      <PanelSlider value={patch.ampAttack / 127} onChange={(v) => setEnv({ attack: v * 127 })} label="A" />
      <PanelSlider value={patch.ampDecay / 127} onChange={(v) => setEnv({ decay: v * 127 })} label="D" />
      <PanelSlider value={patch.ampSustain / 127} onChange={(v) => setEnv({ sustain: v * 127 })} label="S" />
      <PanelSlider value={patch.ampRelease / 127} onChange={(v) => setEnv({ release: v * 127 })} label="R" />
    </div>
    </div>
  );
}


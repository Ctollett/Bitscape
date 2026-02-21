import { DelayEffect } from './effects/DelayEffect';
import { ReverbEffect } from './effects/ReverbEffect';
import { ChorusEffect } from './effects/ChorusEffect';

export function EffectsPanel() {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      gap: '16px',
      padding: '16px'
    }}>
      <DelayEffect />
      <ReverbEffect />
      <ChorusEffect />
    </div>
  );
}

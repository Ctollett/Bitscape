import { PanelSlider } from '../PanelSlider';
import { colors } from '../../tokens';

interface LFOSlidersProps {
  speed: number;
  depth: number;
  onSpeedChange: (v: number) => void;
  onDepthChange: (v: number) => void;
  lfoIndex: 1 | 2;
}

export function LFOSliders({ speed, depth, onSpeedChange, onDepthChange, lfoIndex }: LFOSlidersProps) {
  const color = lfoIndex === 1 ? colors.section.lfo1 : colors.section.lfo2;

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
      <PanelSlider
        color={color}
        value={Math.sqrt(speed / 100)}
        onChange={(v) => onSpeedChange(v * v * 100)}
        label="Speed"
      />
      <PanelSlider
        color={color}
        value={depth}
        onChange={onDepthChange}
        label="Depth"
      />
    </div>
  );
}

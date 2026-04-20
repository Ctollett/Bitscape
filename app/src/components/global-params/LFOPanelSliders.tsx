import { PanelSlider } from '../../components/PanelSlider';

interface LFOPanelSlidersProps {
  speed: number;
  depth: number;
  onSpeedChange: (v: number) => void;
  onDepthChange: (v: number) => void;
}

export function LFOPanelSliders({ speed, depth, onSpeedChange, onDepthChange }: LFOPanelSlidersProps) {
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-end' }}>
      <PanelSlider
        value={speed / 10}
        onChange={(v) => onSpeedChange(v * 10)}
        label="Speed"
      />
      <PanelSlider
        value={depth}
        onChange={onDepthChange}
        label="Depth"
      />
    </div>
  );
}

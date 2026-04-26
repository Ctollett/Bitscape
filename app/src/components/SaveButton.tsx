import { colors } from '../tokens';
import SaveIcon from '../assets/svgs/save.svg?react';
import MenuIcon from '../assets/svgs/menu.svg?react';
import { PopUpModal } from './PresetSaveModal/PresetSaveModal';

const W = 44;
const H = 20;
const R = 6;
const MID = W / 2; // 22
const S = colors.text.title;

// All arcs are 90° clockwise (sweep=1).
// Left "C": full outline of left rounded rect, minus the right vertical edge.
const LEFT = `
  M ${MID - R} 0
  A ${R} ${R} 0 0 1 ${MID} ${R}
  M ${MID} ${H - R}
  A ${R} ${R} 0 0 1 ${MID - R} ${H}
  L ${R} ${H}
  A ${R} ${R} 0 0 1 0 ${H - R}
  L 0 ${R}
  A ${R} ${R} 0 0 1 ${R} 0
  L ${MID - R} 0
`.trim();

// Right "C": full outline of right rounded rect, minus the left vertical edge.
const RIGHT = `
  M ${MID} ${R}
  A ${R} ${R} 0 0 1 ${MID + R} 0
  L ${W - R} 0
  A ${R} ${R} 0 0 1 ${W} ${R}
  L ${W} ${H - R}
  A ${R} ${R} 0 0 1 ${W - R} ${H}
  L ${MID + R} ${H}
  A ${R} ${R} 0 0 1 ${MID} ${H - R}
`.trim();

export function SaveButton() {
  return (
    <div style={{ position: 'relative', width: W, height: H }}>
      <PopUpModal />
      <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
        <button style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SaveIcon />
        </button>
        <button style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MenuIcon width={12} height={12} />
        </button>
      </div>
      <svg width={W} height={H} viewBox="-0.5 -0.5 45 21" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <path d={LEFT} stroke={S} strokeWidth={1} fill="none" />
        <path d={RIGHT} stroke={S} strokeWidth={1} fill="none" />
      </svg>
    </div>
  );
}

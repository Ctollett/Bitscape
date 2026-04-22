import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat2, Power, PowerOff } from 'lucide-react';
import { colors, typography } from '../../tokens';
import { EffectCardFront } from './EffectCardFront';
import { EffectCardBack } from './EffectCardBack';

interface EffectCardProps {
  label: string;
  design: React.ReactNode;
  children: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}

export function EffectCard({ label, design, children, enabled, onToggle }: EffectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: 150, gap: 4, alignItems: 'center', alignSelf: 'stretch', justifyContent: 'space-between', paddingTop: 36 }}>
      <AnimatePresence mode="wait">
        <motion.div key={isFlipped ? 'back' : 'front'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {isFlipped
            ? <EffectCardBack>{children}</EffectCardBack>
            : <EffectCardFront design={design} enabled={enabled} />
          }
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        <span style={{ ...typography.label.lg, color: colors.text.muted }}>{label}</span>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setIsFlipped(f => !f)} style={{ display: 'flex', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: colors.text.muted }}>
            <Repeat2 size={12} />
          </button>
          <div style={{ width: 1, height: 10, background: colors.control.track }} />
          <button onClick={onToggle} style={{ display: 'flex', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, color: colors.text.muted }}>
            {enabled ? <Power size={10} /> : <PowerOff size={10} />}
          </button>
        </div>
      </div>
    </div>
  );
}

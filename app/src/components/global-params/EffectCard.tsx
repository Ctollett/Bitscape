import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Repeat2, PowerOff, Power } from 'lucide-react';
import { spacing } from '../../tokens';
import { EffectCardFront } from './EffectCardFront';
import { EffectCardBack } from './EffectCardBack';

interface EffectCardProps {
  label: string;
  design: React.ReactNode;
  children: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
  index: number;
}

export function EffectCard({ label, design, children, enabled, onToggle, index }: EffectCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => setIsFlipped(f => !f);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '224px', height: '100%', borderTop: '1px solid black', borderRight: index < 3 ? '1px solid black' : 'none', justifyContent: 'flex-start', gap: spacing['2xl'] }}>
      <div style={{ display: 'flex', width: '100%', height: '36px', justifyContent: 'space-between', padding: '12px' }}>
        <button onClick={handleFlip} style={{ display: 'flex', height: '100px', border: 'none', backgroundColor: 'transparent' }}><Repeat2 /></button>
        <span style={{ color: 'black' }}>{label}</span>
        <button onClick={onToggle} style={{ display: 'flex', height: '100px', border: 'none', backgroundColor: 'transparent' }}>{enabled ? <Power /> : <PowerOff />}</button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={isFlipped ? 'back' : 'front'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {isFlipped
            ? <EffectCardBack>{children}</EffectCardBack>
            : <EffectCardFront design={design} enabled={enabled} />
          }
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

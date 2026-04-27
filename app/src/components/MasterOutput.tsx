import { useState, useRef, useEffect } from 'react';
import { PanelKnob } from './PanelKnob';
import { colors, spacing, typography, borderRadius } from '../tokens';
import { getLevels } from '../audio/engine';

export function MasterOutput() {
  const [drive, setDrive] = useState(0);
  const [mix, setMix] = useState(0.5);
  const rafRef = useRef<number>(0)
  const smoothedL = useRef<number>(0)
  const smoothedR = useRef<number>(0)

  const blackLRef = useRef<HTMLDivElement>(null)
  const yellowLRef = useRef<HTMLDivElement>(null)
  const redLRef = useRef<HTMLDivElement>(null)

  const blackRRef = useRef<HTMLDivElement>(null)
  const yellowRRef = useRef<HTMLDivElement>(null)
  const redRRef = useRef<HTMLDivElement>(null)


 useEffect(() => {
     const scaleFactor = 2.5
 
  const tick = () => {

     const { l, r } = getLevels()

     smoothedL.current = smoothedL.current + (l - smoothedL.current) * 0.15
     smoothedR.current = smoothedR.current + (r - smoothedR.current) * 0.15

     const scaledL = smoothedL.current * scaleFactor
     const scaledR = smoothedR.current * scaleFactor

     const clampedL = Math.min(scaledL, 1)
     const clampedR = Math.min(scaledR, 1)


     if(blackLRef.current && yellowLRef.current && redLRef.current) {
        blackLRef.current.style.width = `${Math.min(clampedL, 0.7) / 0.7 * 112}px`
        yellowLRef.current.style.width = `${Math.max(0, Math.min(clampedL, 0.9) - 0.7) / 0.2 * 32}px`
        redLRef.current.style.width = `${Math.max(0, Math.min(clampedL, 1.0) - 0.9) / 0.1 * 16}px`
      }

      if(blackRRef.current && yellowRRef.current && redRRef.current) {
         blackRRef.current.style.width = `${Math.min(clampedR, 0.7) / 0.7 * 112}px`
         yellowRRef.current.style.width = `${Math.max(0, Math.min(clampedR, 0.9) - 0.7) / 0.2 * 32}px`
         redRRef.current.style.width = `${Math.max(0, Math.min(clampedR, 1.0) - 0.9) / 0.1 * 16}px`
      }
    
     
  rafRef.current = requestAnimationFrame(tick)
  }

  rafRef.current = requestAnimationFrame(tick)

  return () => {
    cancelAnimationFrame(rafRef.current)
  }

 }, [])

  return (
    <div style={{ gridRow: '1 / 3', display: 'grid', gridTemplateRows: 'subgrid', gridTemplateColumns: 'auto auto', alignItems: 'center', columnGap: spacing.lg }}>
      {/* L meter — row 1 */}
      <div style={{ alignSelf: 'flex-start', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <span style={{ ...typography.label.lg, lineHeight: 1, width: 8 }}>L</span>
        <div style={{ position: 'relative' }}>
        <div ref={blackLRef} style={{ position: 'absolute', height: 2, top: 0, left: 0, backgroundColor: 'black' }}></div>
        <div ref={yellowLRef} style={{ position: 'absolute', height: 2, top: 0, left: 112, backgroundColor: 'yellow' }}></div>
        <div ref={redLRef} style={{ position: 'absolute', height: 2, top: 0, left: 144, backgroundColor: 'red' }}></div>
        <div style={{ width: 160, height: 2, backgroundColor: colors.control.track, borderRadius: borderRadius.full }} />
         </div>
      </div>
      {/* Knobs — span both rows */}
      <div style={{ gridRow: '1 / 3', gridColumn: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <PanelKnob color={colors.text.primary} value={drive} onChange={setDrive} label="DRIVE" size={28} />
        <PanelKnob color={colors.text.primary} value={mix} onChange={setMix} label="MIX" size={28} />
      </div>
      {/* R meter — row 2 */}
      <div style={{ alignSelf: 'flex-start', marginTop: -4, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <span style={{ ...typography.label.lg, lineHeight: 1, width: 8 }}>R</span>
        <div style={{ position: 'relative' }}>
         <div ref={blackRRef} style={{ position: 'absolute', height: 2, top: 0, left: 0, backgroundColor: 'black' }}></div>
        <div ref={yellowRRef} style={{ position: 'absolute', height: 2, top: 0, left: 112, backgroundColor: 'yellow' }}></div>
        <div ref={redRRef} style={{ position: 'absolute', height: 2, top: 0, left: 144, backgroundColor: 'red' }}></div>
        <div style={{ width: 160, height: 2, backgroundColor: colors.control.track, borderRadius: borderRadius.full }} />
         </div>
      </div>
    </div>
  );
}

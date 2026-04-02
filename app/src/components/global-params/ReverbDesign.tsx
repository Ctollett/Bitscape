import { useEffect, useRef, useState } from 'react';
import { usePatch } from '../../fm-canvas/patch-context';
import { onNoteOn, onNoteOff } from '../../audio/note-events';

const BASE_RX = 13.37;
const BASE_RY = 41;
const CX_CENTER = 34.60;
const CY = 42;
const SPREAD = 20.23;

interface Ripple {
  progress: number;        // position (0 → 1+)
  releasing: boolean;      // true once note released
  releaseProgress: number; // 0 → 1 after release, drives smooth fade-out
}

interface PendingRipple {
  spawnAt: number;
}

interface Impulse {
  amplitude: number;
  phase: number;
}

export function ReverbDesign() {
  const { patch } = usePatch();
  const patchRef = useRef(patch);
  patchRef.current = patch;

  const ripples = useRef<Ripple[]>([]);
  const pending = useRef<PendingRipple[]>([]);
  const impulses = useRef<Impulse[]>([]);
  const frameRef = useRef(0);
  const activeNotes = useRef(0);
  const nextAutoSpawn = useRef(0);
  const breathScalesRef = useRef([1, 1]);
  const rafRef = useRef<number>();
  const [, forceRender] = useState(0);

  useEffect(() => {
    const offNoteOn = onNoteOn(() => {
      activeNotes.current += 1;
      pending.current.push({ spawnAt: frameRef.current });
      impulses.current.push({ amplitude: 1.0, phase: Math.PI / 2 }); // start at sin peak for immediate response
    });
    const offNoteOff = onNoteOff(() => {
      activeNotes.current = Math.max(0, activeNotes.current - 1);
      // mark all active ripples to start fading when note released
      if (activeNotes.current === 0) {
        ripples.current = ripples.current.map(rp => ({ ...rp, releasing: true }));
      }
    });
    return () => { offNoteOn(); offNoteOff(); };
  }, []);

  useEffect(() => {
    const tick = () => {
      const rippleSpeed = 0.007 + (1 - patchRef.current.reverbDecay) * 0.016;
      const fadeOutRate = 0.012 + (1 - patchRef.current.reverbDecay) * 0.03;
      const spawnInterval = Math.round(10 + (1 - patchRef.current.reverbDecay) * 8);

      if (activeNotes.current > 0 && frameRef.current >= nextAutoSpawn.current) {
        pending.current.push({ spawnAt: frameRef.current });
        nextAutoSpawn.current = frameRef.current + spawnInterval;
      }

      pending.current = pending.current.filter(p => {
        if (frameRef.current >= p.spawnAt) {
          ripples.current.push({ progress: 0, releasing: false, releaseProgress: 0 });
          return false;
        }
        return true;
      });

      ripples.current = ripples.current
        .map(rp => {
          const releasing = rp.releasing || rp.progress > 0.95;
          const releaseProgress = releasing ? rp.releaseProgress + fadeOutRate : 0;
          return { ...rp, progress: rp.progress + rippleSpeed, releasing, releaseProgress };
        })
        .filter(rp => rp.releaseProgress < 1 && rp.progress < 1.2);

      // Impulse-driven breath on the two static rings
      const decayRate = 0.012 + (1 - patchRef.current.reverbDecay) * 0.025;
      impulses.current = impulses.current
        .map(imp => ({ amplitude: imp.amplitude * (1 - decayRate), phase: imp.phase + 0.07 }))
        .filter(imp => imp.amplitude > 0.005);

      breathScalesRef.current = [0, Math.PI * 0.5].map((phaseOffset) => {
        const displacement = impulses.current.reduce((sum, imp) =>
          sum + imp.amplitude * Math.sin(imp.phase + phaseOffset), 0);
        return 1 + 0.18 * displacement;
      });

      frameRef.current += 1;
      forceRender(n => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const mix = Math.max(0.15, patchRef.current.reverbMix);
  const maxSpread = SPREAD * 1.5 * (1 - patchRef.current.reverbDamping * 0.5);

  return (
    <svg width="70" height="84" viewBox="0 0 70 84" fill="none" xmlns="http://www.w3.org/2000/svg" overflow="visible">
      {ripples.current.map((rp, ri) => {
        const offset = rp.progress * maxSpread;
        // smooth sine ease-in on emergence, cosine ease-out on release
        const fadeIn = Math.sin(Math.min(rp.progress / 0.2, 1) * Math.PI / 2);
        const fadeOut = rp.releasing ? Math.cos(rp.releaseProgress * Math.PI / 2) : 1.0;
        const opacity = fadeIn * fadeOut * 0.75 * mix;
        return [
          <ellipse
            key={`${ri}-l`}
            cx={(CX_CENTER - 7) - offset}
            cy={CY}
            rx={BASE_RX}
            ry={BASE_RY}
            stroke="#D94F2B"
            strokeWidth={1.5}
            fill="none"
            opacity={opacity}
          />,
          <ellipse
            key={`${ri}-r`}
            cx={(CX_CENTER + 7) + offset}
            cy={CY}
            rx={BASE_RX}
            ry={BASE_RY}
            stroke="#D94F2B"
            strokeWidth={1.5}
            fill="none"
            opacity={opacity}
          />,
        ];
      })}

      {[CX_CENTER - 7, CX_CENTER + 7].map((cx, i) => {
        const s = breathScalesRef.current[i];
        return (
          <g key={i} transform={`translate(${cx}, ${CY}) scale(${s}) translate(${-cx}, ${-CY})`}>
            <ellipse cx={cx} cy={CY} rx={BASE_RX} ry={BASE_RY} stroke="#D94F2B" strokeWidth={2} fill="none" />
          </g>
        );
      })}
    </svg>
  );
}

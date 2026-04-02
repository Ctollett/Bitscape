import { useEffect, useRef, useState } from 'react';
import { usePatch } from '../../fm-canvas/patch-context';

const CX = 42;
const CY = 42;
const BALL_R = 7;
const OUTER_R = 41;
const BOUNDARY = OUTER_R - BALL_R;
const RING_RADII = [16, 19, 22, 25, 28, 31, 34, 37, 39, 41];
const INFLUENCE = [0.65, 0.58, 0.50, 0.42, 0.34, 0.26, 0.18, 0.10, 0.04, 0];
const BASE_OPACITY = 0;

function getInfluenceAtRadius(r: number) {
  const t = Math.max(0, Math.min(1, (r - BALL_R) / (OUTER_R - BALL_R)));
  const maxInf = INFLUENCE[0];
  return maxInf * (1 - t);
}

interface Ripple { r: number; strength: number; }
interface PendingRipple { spawnAt: number; strength: number; }

export function DelayDesign() {
  const { patch } = usePatch();
  const patchRef = useRef(patch);
  patchRef.current = patch;

  const initialAngle = useRef(Math.random() * 2 * Math.PI);
  const ballPos = useRef({ x: CX, y: CY });
  const vel = useRef({ dx: Math.cos(initialAngle.current), dy: Math.sin(initialAngle.current) });
  const ripples = useRef<Ripple[]>([]);
  const pending = useRef<PendingRipple[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number>();
  const [, forceRender] = useState(0);

  useEffect(() => {
    const tick = () => {
      const speed = 0.8 + (1 - patchRef.current.delayMs / 1000) * 1.8;
      const magnitude = Math.sqrt(vel.current.dx ** 2 + vel.current.dy ** 2);
      vel.current.dx = (vel.current.dx / magnitude) * speed;
      vel.current.dy = (vel.current.dy / magnitude) * speed;

      let nx = ballPos.current.x + vel.current.dx;
      let ny = ballPos.current.y + vel.current.dy;
      const dx = nx - CX;
      const dy = ny - CY;
      const dist = Math.sqrt(dx ** 2 + dy ** 2);

      if (dist >= BOUNDARY) {
        const nx_ = dx / dist;
        const ny_ = dy / dist;
        const dot = vel.current.dx * nx_ + vel.current.dy * ny_;
        vel.current.dx -= 2 * dot * nx_;
        vel.current.dy -= 2 * dot * ny_;
        const nudge = (Math.random() - 0.5) * 1.0;
        const angle = Math.atan2(vel.current.dy, vel.current.dx) + nudge;
        vel.current.dx = Math.cos(angle) * speed;
        vel.current.dy = Math.sin(angle) * speed;
        nx = CX + nx_ * (BOUNDARY - 0.1);
        ny = CY + ny_ * (BOUNDARY - 0.1);

          const count = Math.max(1, Math.round(patchRef.current.delayFeedback * 5));
        const impactStrength = Math.min(1, speed / 2.6);
        const stagger = 8 + (1 - impactStrength) * 20; // fast hit = tighter stagger
        for (let i = 0; i < count; i++) {
          pending.current.push({ spawnAt: frameRef.current + i * stagger, strength: 1 });
        }
      }

      ballPos.current = { x: nx, y: ny };
      frameRef.current += 1;

      // spawn pending ripples when their time comes
      pending.current = pending.current.filter(p => {
        if (frameRef.current >= p.spawnAt) {
          ripples.current.push({ r: BALL_R, strength: p.strength });
          return false;
        }
        return true;
      });

      ripples.current = ripples.current
        .map(rp => ({ ...rp, r: rp.r + 0.4 }))
        .filter(rp => rp.r < OUTER_R + 2);

      forceRender(n => n + 1);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const ringCount = Math.max(1, Math.round(patchRef.current.delayFeedback * RING_RADII.length));

  return (
    <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx={CX} cy={CY} r={OUTER_R} stroke="#4E7AAA" strokeWidth={2} fill="none" />

      {/* membrane rings */}
      {RING_RADII.slice(0, ringCount).map((r, i) => {
        const cx = CX + (ballPos.current.x - CX) * INFLUENCE[i];
        const cy = CY + (ballPos.current.y - CY) * INFLUENCE[i];
        return <circle key={i} cx={cx} cy={cy} r={r} stroke="#4E7AAA" strokeWidth={1} fill="none" opacity={BASE_OPACITY} />;
      })}

      {/* expanding ripples using interpolated influence so they follow the same path */}
      {ripples.current.map((rp, i) => {
        const progress = (rp.r - BALL_R) / (OUTER_R - BALL_R);
        const opacity = Math.sin(progress * Math.PI) * 0.75;
        const inf = getInfluenceAtRadius(rp.r);
        const cx = CX + (ballPos.current.x - CX) * inf;
        const cy = CY + (ballPos.current.y - CY) * inf;
        return <circle key={i} cx={cx} cy={cy} r={rp.r} stroke="#4E7AAA" strokeWidth={1} fill="none" opacity={opacity * Math.max(0.2, patchRef.current.delayMix)} />;
      })}

      <circle cx={ballPos.current.x} cy={ballPos.current.y} r={BALL_R} fill="#4E7AAA" />
    </svg>
  );
}

import { usePatch } from './patch-context';
import { useRef, useCallback, useEffect } from 'react';

import {
  NODE_RADIUS,
  RING_RADIUS,
  OPERATOR_COLORS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from './constants';

import type { Point } from './types'


const WAVE_W = 50;
const WAVE_H = 30;

function waveformPath(type: number): string {
  const w = WAVE_W;
  const h = WAVE_H;
  const mid = h / 2;
  switch (type) {
    case 0:
      return `M0,${mid} C${w * 0.25},0 ${w * 0.25},0 ${w * 0.5},${mid} C${w * 0.75},${h} ${w * 0.75},${h} ${w},${mid}`;
    case 1:
      return `M0,${h} L0,0 L${w * 0.5},0 L${w * 0.5},${h} L${w},${h} L${w},0`;
    case 2:
      return `M0,${h} L${w * 0.5},0 L${w * 0.5},${h} L${w},0`;
    case 3:
      return `M0,${mid} L${w * 0.25},0 L${w * 0.75},${h} L${w},${mid}`;
    case 4:
      return `M0,${mid} L${w * 0.1},${h * 0.2} L${w * 0.2},${h * 0.7} L${w * 0.3},${h * 0.1} L${w * 0.4},${h * 0.8} L${w * 0.5},${h * 0.3} L${w * 0.6},${h * 0.9} L${w * 0.7},${h * 0.15} L${w * 0.8},${h * 0.6} L${w * 0.9},${h * 0.25} L${w},${mid}`;
    default:
      return `M0,${mid} L${w},${mid}`;
  }
}

interface OperatorNodeProps {
  opIndex: number;
  isCarrier: boolean;
  onStartConnection: (opIndex: number) => void;
  onEndConnection: (opIndex: number) => void;
  onOpenDetail: (opIndex: number) => void;
  onSelect: (opIndex: number) => void;
  isSelected: boolean;
  onDragMove?: (opIndex: number, pos: Point) => void;
  dragPos?: Point | null;
  isTargetable?: boolean;
  getPullToward?: () => Point | null;
  onPullStrength?: (strength: number) => void;
}

function deformedRingPath(cx: number, cy: number, radius: number, pullX: number, pullY: number, pullStrength?: number): string {
  const pullAngle = Math.atan2(pullY - cy, pullX - cx)
  const dist = Math.sqrt((pullX - cx) ** 2 + (pullY - cy) ** 2)
  const pullAmount = pullStrength !== undefined ? pullStrength : Math.min(dist * 0.03, radius * 0.08)
  const N = 80
  const points: string[] = []
  for (let i = 0; i < N; i++) {
    const θ = (i / N) * 2 * Math.PI
    const angleDiff = θ - pullAngle
    const factor = Math.max(0, Math.cos(angleDiff)) ** 8
    const r = radius + pullAmount * factor
    points.push(`${cx + r * Math.cos(θ)},${cy + r * Math.sin(θ)}`)
  }
  return `M ${points.join(' L ')} Z`
}

export function OperatorNode({
  opIndex,
  isCarrier: _isCarrier,
  onStartConnection,
  onEndConnection,
  onOpenDetail: _onOpenDetail,
  onSelect,
  isSelected,
  onDragMove,
  dragPos,
  isTargetable,
  getPullToward,
  onPullStrength,
}: OperatorNodeProps) {
  const { patch, dispatch } = usePatch();
  const op = patch.operators[opIndex];

  const nodeRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const pendingPos = useRef({x: 0, y: 0})
  const ringPathRef = useRef<SVGPathElement | null>(null)
  const ringCircleRef = useRef<SVGCircleElement | null>(null)
  const bumpAmountRef = useRef(0)
  const pullDirRef = useRef<{ x: number; y: number } | null>(null)
  const wasTensionRef = useRef(false)
  const rippleAmplRef = useRef(0)
  const ripplePhaseRef = useRef(0)
  const ripplingRef = useRef(false)
  const getPullRef = useRef(getPullToward)
  const onPullStrengthRef = useRef(onPullStrength)
  const opPosRef = useRef(op.position)
  getPullRef.current = getPullToward
  onPullStrengthRef.current = onPullStrength
  opPosRef.current = op.position

  useEffect(() => {
    let raf: number
    const tick = () => {
      const target = getPullRef.current?.()
      const { x: cx, y: cy } = opPosRef.current
      const pathEl = ringPathRef.current
      const circleEl = ringCircleRef.current

      const showBump = (amount: number) => {
        const d = pullDirRef.current
        if (!pathEl || !circleEl || !d) return
        pathEl.setAttribute('d', deformedRingPath(cx, cy, RING_RADIUS, cx + d.x * 9999, cy + d.y * 9999, amount))
        pathEl.style.display = ''
        circleEl.style.display = 'none'
      }
      const showCircle = () => {
        if (!pathEl || !circleEl) return
        pathEl.style.display = 'none'
        circleEl.style.display = ''
      }

      // --- Active tension: track bump toward pullStrength ---
      if (target) {
        const dx = target.x - cx
        const dy = target.y - cy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const pullStrength = Math.min(dist * 0.025, RING_RADIUS * 0.28)

        if (pullStrength > 0.5) {
          if (dist > 0) pullDirRef.current = { x: dx / dist, y: dy / dist }
          bumpAmountRef.current += (pullStrength - bumpAmountRef.current) * 0.15
          wasTensionRef.current = true
          showBump(bumpAmountRef.current)
          onPullStrengthRef.current?.(bumpAmountRef.current)
          raf = requestAnimationFrame(tick); return
        }
      }

      // --- Release: trigger ripple on first frame ---
      if (wasTensionRef.current) {
        wasTensionRef.current = false
        ripplingRef.current = true
        rippleAmplRef.current = bumpAmountRef.current * 0.45
        ripplePhaseRef.current = 0
        bumpAmountRef.current = 0
      }

      // --- Ripple decay: sinusoidal oscillation along pull axis ---
      if (ripplingRef.current) {
        ripplePhaseRef.current += 0.55
        rippleAmplRef.current *= 0.78
        const ripple = rippleAmplRef.current * Math.sin(ripplePhaseRef.current)

        if (rippleAmplRef.current < 0.3) {
          ripplingRef.current = false
          rippleAmplRef.current = 0
          showCircle()
          onPullStrengthRef.current?.(0)
        } else {
          if (Math.abs(ripple) > 0.2) {
            showBump(ripple)
            onPullStrengthRef.current?.(Math.max(0, ripple))
          } else {
            showCircle()
            onPullStrengthRef.current?.(0)
          }
        }
      } else {
        showCircle()
        onPullStrengthRef.current?.(0)
      }

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const flushPosition = useCallback(() => {
    const { x, y } = pendingPos.current
    dispatch({ type: 'MOVE_OPERATOR', opIndex, position: { x, y } })
    if (nodeRef.current) {
      nodeRef.current.style.left = x - NODE_RADIUS + 'px'
      nodeRef.current.style.top = y - NODE_RADIUS + 'px'
    }
    rafRef.current = 0;
  }, [dispatch, opIndex]);

  const onPointerDown = (e: React.PointerEvent) => {
    onSelect(opIndex)
    e.stopPropagation()
    const canvas = nodeRef.current?.parentElement?.getBoundingClientRect()
    if (!canvas) return
    const pointerX = e.clientX - canvas.left;
    const pointerY = e.clientY - canvas.top;
    dragStartRef.current = { x: pointerX - op.position.x, y: pointerY - op.position.y }
    isDraggingRef.current = true;
    nodeRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerDownRing = (e: React.PointerEvent) => {
    e.stopPropagation()
    document.body.style.cursor = 'grabbing'
    onStartConnection(opIndex)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const canvas = nodeRef.current?.parentElement?.getBoundingClientRect()
    if (!isDraggingRef.current) return;
    if (!canvas) return
    const pointerX = e.clientX - canvas.left;
    const pointerY = e.clientY - canvas.top;
    const newPos = { x: Math.max(NODE_RADIUS, Math.min(CANVAS_WIDTH - NODE_RADIUS, pointerX - dragStartRef.current.x)), y: Math.max(NODE_RADIUS, Math.min(CANVAS_HEIGHT - NODE_RADIUS, pointerY - dragStartRef.current.y)) }
    pendingPos.current = newPos;
    onDragMove?.(opIndex, newPos)
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(flushPosition)
    }
  }

  const onPointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false
    cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    document.body.style.cursor = ''
    nodeRef.current?.releasePointerCapture(e.pointerId)
    onEndConnection(opIndex)
  }

  return (
    <>
      {(() => {
        const isConnected = patch.connections.some(c => c.src === opIndex || c.dst === opIndex)
        const ringColor = isTargetable ? 'white' : OPERATOR_COLORS[opIndex]
        const activePull = dragPos ?? null
        return (isSelected || isConnected || isTargetable) ? (
          <svg onPointerDown={onPointerDownRing} onPointerUp={onPointerUp} style={{ cursor: 'grab', position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'all' }} width={0} height={0}>
            {activePull ? (
              <path d={deformedRingPath(op.position.x, op.position.y, RING_RADIUS, activePull.x, activePull.y)} fill="none" stroke={ringColor} strokeWidth={2} strokeDasharray="6 4" />
            ) : (
              <>
                <path ref={ringPathRef} style={{ display: 'none' }} fill="none" stroke={ringColor} strokeWidth={2} strokeDasharray="6 4" d="" />
                <circle ref={ringCircleRef} className={isTargetable ? 'ring-targetable' : ''} cx={op.position.x} cy={op.position.y} r={RING_RADIUS} fill="none" stroke={ringColor} strokeWidth={2} strokeDasharray="6 4" />
              </>
            )}
          </svg>
        ) : null
      })()}
      <div ref={nodeRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} className='operator-node' style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: op.position.x - NODE_RADIUS, top: op.position.y - NODE_RADIUS, width: NODE_RADIUS * 2, height: NODE_RADIUS * 2, borderRadius: '50%', border: `1px solid ${OPERATOR_COLORS[opIndex]}` }}>
        <svg width={WAVE_W} height={WAVE_H} viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} style={{ pointerEvents: 'none' }}>
          <path d={waveformPath(patch.operatorWaveforms[opIndex])} fill="none" stroke={OPERATOR_COLORS[opIndex]} strokeWidth={2} />
        </svg>
      </div>
    </>
  );
}

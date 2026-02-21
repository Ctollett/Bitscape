import { usePatch } from './patch-context';
import { useRef, useCallback} from 'react';
import {
  NODE_RADIUS,
  OPERATOR_COLORS,
  CANVAS_SIZE,
} from './constants';

const WAVE_W = 50;
const WAVE_H = 30;

function waveformPath(type: number): string {
  const w = WAVE_W;
  const h = WAVE_H;
  const mid = h / 2;
  switch (type) {
    case 0: // Sine
      return `M0,${mid} C${w * 0.25},0 ${w * 0.25},0 ${w * 0.5},${mid} C${w * 0.75},${h} ${w * 0.75},${h} ${w},${mid}`;
    case 1: // Square
      return `M0,${h} L0,0 L${w * 0.5},0 L${w * 0.5},${h} L${w},${h} L${w},0`;
    case 2: // Saw
      return `M0,${h} L${w * 0.5},0 L${w * 0.5},${h} L${w},0`;
    case 3: // Triangle
      return `M0,${mid} L${w * 0.25},0 L${w * 0.75},${h} L${w},${mid}`;
    case 4: // Noise
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
    onSelect: (opIndex: number) => void
isSelected: boolean
}

export function OperatorNode({
  opIndex,
  isCarrier,
  onStartConnection,
  onEndConnection,
  onOpenDetail,
  onSelect,
  isSelected,
}: OperatorNodeProps) {
  const { patch, dispatch } = usePatch();
  const op = patch.operators[opIndex];
  const nodeRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef(0)
  const pendingPos = useRef({x: 0, y: 0})
  const RING_RADIUS = NODE_RADIUS * 1.3


  const flushPosition = useCallback(() => {
    const { x, y}  = pendingPos.current

    dispatch({ type: 'MOVE_OPERATOR', opIndex, position: { x, y } })

    if(nodeRef.current) {
      nodeRef.current.style.left = x - NODE_RADIUS + 'px'
      nodeRef.current.style.top = y - NODE_RADIUS + 'px'
    }

    rafRef.current = 0;

  }, [dispatch, opIndex]);


  const onPointerDown = (e: React.PointerEvent) => {
     onSelect(opIndex)
     e.stopPropagation()

   const canvas = nodeRef.current?.parentElement?.getBoundingClientRect()

    if(!canvas) return

    const pointerX  = e.clientX - canvas.left;
    const pointerY = e.clientY - canvas.top;

    dragStartRef.current = { x: pointerX - op.position.x, y: pointerY - op.position.y}
    isDraggingRef.current = true;

    nodeRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerDownRing = (e: React.PointerEvent) => {
    e.stopPropagation()
    onStartConnection(opIndex)
  
  }

  const onPointerMove = (e: React.PointerEvent) => {

    const canvas = nodeRef.current?.parentElement?.getBoundingClientRect()

    if(!isDraggingRef.current) return;
    if(!canvas) return
    const pointerX  = e.clientX - canvas.left;
    const pointerY = e.clientY - canvas.top;
    const newPos = { x: Math.max(NODE_RADIUS, Math.min(CANVAS_SIZE - NODE_RADIUS, pointerX - dragStartRef.current.x)), y: Math.max(NODE_RADIUS, Math.min(CANVAS_SIZE - NODE_RADIUS, pointerY - dragStartRef.current.y) )}
    pendingPos.current = newPos;
    if (!rafRef.current) {
  rafRef.current = requestAnimationFrame(flushPosition)
}
  }

const onPointerUp = (e: React.PointerEvent) => {
  isDraggingRef.current = false
  cancelAnimationFrame(rafRef.current);
  rafRef.current = 0;
  nodeRef.current?.releasePointerCapture(e.pointerId)
  onEndConnection(opIndex)

}


  



  return (
  <>
  {isSelected && (
<div onPointerDown={onPointerDownRing} style={{cursor: 'pointer', position: 'absolute', border: '2px solid white', width: NODE_RADIUS * 2.6, height: NODE_RADIUS * 2.6, left: op.position.x - NODE_RADIUS * 1.3, top: op.position.y - NODE_RADIUS * 1.3, borderRadius: '50%'}}></div>
  )}
    <div ref={nodeRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} className='operator-node' style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'absolute', left: op.position.x - NODE_RADIUS, top: op.position.y - NODE_RADIUS, width: NODE_RADIUS * 2, height: NODE_RADIUS * 2, borderRadius: '50%', border: `1px solid ${OPERATOR_COLORS[opIndex]}`
}}>
    <svg width={WAVE_W} height={WAVE_H} viewBox={`0 0 ${WAVE_W} ${WAVE_H}`} style={{ pointerEvents: 'none' }}>
      <path d={waveformPath(patch.operatorWaveforms[opIndex])} fill="none" stroke={OPERATOR_COLORS[opIndex]} strokeWidth={2} />
    </svg>
      
    </div>
</>
 
  );
}

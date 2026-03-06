import { useState, useRef } from 'react';
import { usePatch } from './patch-context';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { OperatorNode } from './OperatorNode';
import { ConnectionLine } from './ConnectionLine';
import { DraftConnection } from './DraftConnection';
import { OperatorDetailPanel } from './OperatorDetailPanel';
import type { Point } from './types';
import './fm-canvas.css';

interface InteractionState {
  mode: 'idle' | 'drawing-connection';
  fromOp: number | null;
  mousePos: Point | null;

}
export function FMCanvas() {
const { patch, dispatch } = usePatch()
const [selectedOp, setSelectedOp] = useState<number | null>(null)
const [interaction, setInteraction] = useState<InteractionState>({ mode: 'idle', fromOp: null, mousePos: null})

const canvasRef = useRef<HTMLDivElement>(null)

const onPointerMove = (e: React.PointerEvent) => {

  if(interaction.mode === 'drawing-connection') {
  const canvas = canvasRef.current?.getBoundingClientRect();
  if(!canvas) return
  const pointerX  = e.clientX - canvas.left;
  const pointerY = e.clientY - canvas.top;
  setInteraction(prev => ({ ...prev, mousePos: { x: pointerX, y: pointerY } }))
}
}

const onPointerUp = () => {
if(interaction.mode === 'drawing-connection') {
  setInteraction({ mode: 'idle', fromOp: null, mousePos: null })
}

}


  return (
  <>
  <div ref={canvasRef} onPointerUp={onPointerUp} onPointerMove={onPointerMove} className='fm-canvas' style={{position: 'relative', width: CANVAS_WIDTH, height: CANVAS_HEIGHT}} onPointerDown={() => setSelectedOp(null)}>
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}>
      <filter id="canvas-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="1 0 0 0 0  0.8 0 0 0 0  0 0 0.6 0 0  0 0 0 0.08 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#canvas-noise)" />
    </svg>
    <svg style={{position: 'absolute', top: 0, left: 0, width: CANVAS_WIDTH, height: CANVAS_HEIGHT, pointerEvents: 'none'}}>

      {patch.connections.map((conn) => (
        <ConnectionLine  src={patch.operators[conn.src].position} key={`conn-${conn.src}-${conn.dst}`}
      dst={patch.operators[conn.dst].position} srcOp={conn.src} dstOp={conn.dst} onRemove={() => dispatch({ type: 'REMOVE_CONNECTION', src: conn.src, dst: conn.dst } )} />
      ))}
      {interaction.mode === 'drawing-connection' && interaction.fromOp !== null && interaction.mousePos && (
  <DraftConnection from={patch.operators[interaction.fromOp].position} to={interaction.mousePos} />
)}


    </svg>
    {patch.operators.map((_, i) => (
      <OperatorNode
      key={`op-${i}`}
      opIndex={i}
      isCarrier={false}
      onStartConnection={(opIndex) => setInteraction({ mode: 'drawing-connection', fromOp: opIndex, mousePos: null })}
      onEndConnection={(targetOp) => {
  if (interaction.mode === 'drawing-connection' && interaction.fromOp !== null && interaction.fromOp !== targetOp) {
    dispatch({ type: 'ADD_CONNECTION', src: interaction.fromOp, dst: targetOp })
    setInteraction({ mode: 'idle', fromOp: null, mousePos: null })
  }
}}

      onOpenDetail={() => {}}
      onSelect={setSelectedOp}
      isSelected={selectedOp === i}
      />
    ))}
    {selectedOp !== null && (
      <OperatorDetailPanel opIndex={selectedOp} onClose={() => setSelectedOp(null)} />
    )}
  </div>
  </>
  );

}

/** 2D coordinate on the canvas */
export interface Point {
  x: number;
  y: number;
}

/**
 * Waveform type IDs matching oscillator.rs WaveType enum order:
 * 0=Sine, 1=Square, 2=Saw, 3=Triangle, 4=Noise
 */
export type WaveTypeId = 0 | 1 | 2 | 3 | 4;

/** Per-operator state visible on the canvas */
export interface OperatorPatch {
  position: Point;
  waveform: WaveTypeId;
  ratio: number;        // 0.25 – 16.0
  ringAngle: number;    // radians, used to derive ratio via snap table
}

/** A directed modulation connection between two operators */
export interface Connection {
  src: number;  // operator index 0-3
  dst: number;  // operator index 0-3  (src === dst means self-loop / feedback)
}

/** Self-loop visual state for feedback */
export interface SelfLoop {
  opIndex: number;
  radius: number;  // visual radius in px → maps to feedback amount
}

/** The entire serializable patch for the FM canvas */
export interface FMCanvasPatch {
  operators: [OperatorPatch, OperatorPatch, OperatorPatch, OperatorPatch];
  connections: Connection[];
  selfLoops: SelfLoop[];

  // Derived engine params (computed from spatial layout)
  algorithmIndex: number;   // 0-7
  modDepthA: number;        // 0-127
  modDepthB: number;        // 0-127
  operatorFeedback: [number, number, number, number]; // 0-127 per operator
  operatorDetune: [number, number, number, number];   // -100 to +100 cents per operator
  operatorHarm: [number, number, number, number];     // -26 to +26 per operator
  operatorLevel: [number, number, number, number];    // 0-127 output level per operator
  harm: number;             // -26 to 26 (global, legacy)
  carrierMix: number;       // 0.0–1.0
  detune: number;           // 0-127 (global, legacy)
  ampAttack: number;        // 0-127
  ampDecay: number;         // 0-127
  ampSustain: number;       // 0-127
  ampRelease: number;       // 0-127
  masterVolume: number;
  masterPan: number;
  portamentoTime: number;
  pitchBendRange: number;
  pitchBend: number;        // -1.0 to +1.0 (pitch bend amount)

  // Per-operator mod envelopes (ADE: Attack, Decay, End level)
  operatorModEnv: [
    { attack: number; decay: number; end: number },
    { attack: number; decay: number; end: number },
    { attack: number; decay: number; end: number },
    { attack: number; decay: number; end: number }
  ];

  operatorWaveforms: [WaveTypeId, WaveTypeId, WaveTypeId, WaveTypeId];
}

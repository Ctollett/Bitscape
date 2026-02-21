import { useRef, useEffect } from 'react';
import { setParam } from '../audio/engine';
import type { FMCanvasPatch } from './types';

/**
 * Watches the patch and sends only changed values to the WASM engine.
 * Uses a ref to track the previously-synced patch for efficient diffing.
 */
export function useEngineSync(patch: FMCanvasPatch): void {
  const prevRef = useRef<FMCanvasPatch | null>(null);

  useEffect(() => {
    const current = patch;
    const prev = prevRef.current;

    // Connections → custom routing
    // Mod depths (distance-based) - MUST be set BEFORE routing
    // so the engine has the correct depth values when applying routing
    if (!prev || prev.modDepthA !== current.modDepthA) {
      console.log(`[engine-sync] modDepthA: ${prev?.modDepthA ?? 'initial'} → ${current.modDepthA}`);
      setParam('set_mod_depth_a', current.modDepthA);
    }
    if (!prev || prev.modDepthB !== current.modDepthB) {
      console.log(`[engine-sync] modDepthB: ${prev?.modDepthB ?? 'initial'} → ${current.modDepthB}`);
      setParam('set_mod_depth_b', current.modDepthB);
    }

    // Connections → custom routing (set AFTER depths)
    // Also update routing when feedback changes (affects self-loops)
    const connsChanged = !prev
      || prev.connections.length !== current.connections.length
      || prev.connections.some((c, i) =>
          c.src !== current.connections[i].src || c.dst !== current.connections[i].dst);

    const feedbackChanged = !prev || prev.operatorFeedback.some((fb, i) => fb !== current.operatorFeedback[i]);

    if (connsChanged || feedbackChanged) {
      // Include both user connections AND automatic self-loops for feedback
      const allConnections = [...current.connections];

      // Add self-loops for ALL operators that have feedback > 0
      // This enables feedback to work on carriers and modulators alike
      for (let opIndex = 0; opIndex < 4; opIndex++) {
        if (current.operatorFeedback[opIndex] > 0) {
          // Only add self-loop if not already present
          if (!allConnections.some(c => c.src === opIndex && c.dst === opIndex)) {
            allConnections.push({ src: opIndex, dst: opIndex });
          }
        }
      }

      const modFlat = new Uint32Array(allConnections.length * 2);
      for (let i = 0; i < allConnections.length; i++) {
        modFlat[i * 2] = allConnections[i].src;
        modFlat[i * 2 + 1] = allConnections[i].dst;
      }

      const dstSet = new Set(current.connections.map(c => c.dst));
      const srcSet = new Set(current.connections.map(c => c.src));
      const carriers: number[] = [];
      for (let i = 0; i < 4; i++) {
        if (!srcSet.has(i) || dstSet.has(i)) {
          carriers.push(i);
        }
      }
      if (carriers.length === 0) carriers.push(0);

      const carrierFlat = new Uint32Array(carriers);
      console.log('[engine-sync] routing:', current.connections.map(c => `${c.src}→${c.dst}`).join(', '), 'carriers:', carriers);
      setParam('set_custom_routing', modFlat, carrierFlat);

    }

    // Per-operator feedback
    for (let i = 0; i < 4; i++) {
      if (!prev || prev.operatorFeedback[i] !== current.operatorFeedback[i]) {
        console.log(`[engine-sync] operatorFeedback[${i}]: ${prev?.operatorFeedback[i] ?? 'initial'} → ${current.operatorFeedback[i]}`);
        setParam('set_operator_feedback', i, current.operatorFeedback[i]);
      }
    }

    // Per-operator detune (in cents, ±100)
    for (let i = 0; i < 4; i++) {
      if (!prev || prev.operatorDetune[i] !== current.operatorDetune[i]) {
        setParam('set_operator_detune', i, current.operatorDetune[i]);
      }
    }

    // Per-operator harm (wave-folding, -26 to +26)
    for (let i = 0; i < 4; i++) {
      if (!prev || prev.operatorHarm[i] !== current.operatorHarm[i]) {
        setParam('set_operator_harm', i, current.operatorHarm[i]);
      }
    }

    // Per-operator level (output volume, 0-127)
    for (let i = 0; i < 4; i++) {
      if (!prev || prev.operatorLevel[i] !== current.operatorLevel[i]) {
        setParam('set_operator_level', i, current.operatorLevel[i]);
      }
    }

    // Harm (global, legacy)
    if (!prev || prev.harm !== current.harm) {
      setParam('set_harm', current.harm);
    }

    // Carrier mix
    if (!prev || prev.carrierMix !== current.carrierMix) {
      setParam('set_carrier_mix', current.carrierMix);
    }

    // Detune
    if (!prev || prev.detune !== current.detune) {
      setParam('set_detune', current.detune);
    }

    // Amp envelope
    if (!prev || prev.ampAttack !== current.ampAttack || prev.ampDecay !== current.ampDecay || prev.ampSustain !== current.ampSustain || prev.ampRelease !== current.ampRelease) {
      setParam('set_amp_env', current.ampAttack, current.ampDecay, current.ampSustain, current.ampRelease);
    }

    if (!prev || prev.masterVolume !== current.masterVolume) {
    setParam('set_volume', current.masterVolume);
    }

    if (!prev || prev.masterPan !== current.masterPan) {
    setParam('set_pan', current.masterPan);
    }

    if (!prev || prev.portamentoTime !== current.portamentoTime) {
    setParam('set_portamento_time', current.portamentoTime);
    }

    if (!prev || prev.pitchBendRange !== current.pitchBendRange) {
    setParam('set_pitch_bend_range', current.pitchBendRange);
    }

    if (!prev || prev.pitchBend !== current.pitchBend) {
    setParam('set_pitch_bend', current.pitchBend);
    }


    // Per-operator mod envelopes (ADE)
    for (let i = 0; i < 4; i++) {
      const currEnv = current.operatorModEnv[i];
      const prevEnv = prev?.operatorModEnv[i];
      if (!prevEnv || prevEnv.attack !== currEnv.attack || prevEnv.decay !== currEnv.decay || prevEnv.end !== currEnv.end) {
        setParam('set_operator_mod_env', i, currEnv.attack, currEnv.decay, currEnv.end);
      }
    }

    // Per-operator params
    for (let i = 0; i < 4; i++) {
      const op = current.operators[i];
      const prevOp = prev?.operators[i];

      if (!prevOp || prevOp.ratio !== op.ratio) {
        switch (i) {
          case 0:
            setParam('set_ratio_c', op.ratio);
            break;
          case 1:
            setParam('set_ratio_a', op.ratio);
            break;
          case 2:
          case 3:
            setParam('set_ratio_b', current.operators[2].ratio, current.operators[3].ratio);
            break;
        }
      }

      if (!prev || current.operatorWaveforms[i] !== prev.operatorWaveforms[i]) {
        setParam('set_operator_waveform', i, current.operatorWaveforms[i]);
      }
    }

    // Snapshot for next diff
    prevRef.current = {
      ...current,
      operators: current.operators.map((op) => ({
        ...op,
        position: { ...op.position },
      })) as [any, any, any, any],
      connections: [...current.connections],
      selfLoops: [...current.selfLoops],
      operatorModEnv: current.operatorModEnv.map(env => ({ ...env })) as [any, any, any, any],
      operatorWaveforms: [...current.operatorWaveforms] as [any, any, any, any],
      operatorFeedback: [...current.operatorFeedback] as [number, number, number, number],
      operatorLevel: [...current.operatorLevel] as [number, number, number, number],
    };
  }, [patch]);
}

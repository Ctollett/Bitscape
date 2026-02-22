import './polyfill_textdecoder.js';
import initWasm, { Synth } from '/wasm/synth_engine.js';

const BLOCK = 128;

class SynthProcessor extends AudioWorkletProcessor {
  constructor(opts) {
    super();
    this.ready = false;

    const { wasmModule, sampleRate } = opts.processorOptions;

    initWasm(wasmModule).then(() => {
      this.synth = new Synth(sampleRate);
      this.ready = true;
      this.port.postMessage({ type: 'ready' });
    });

    this.port.onmessage = (e) => {
      if (!this.ready) return;
      const d = e.data;

      if (d.type === 'note_on') {
        this.synth.note_on(d.args[0], d.args[1]);
      } else if (d.type === 'note_off') {
        this.synth.note_off(d.args[0]);
      } else if (d.type === 'param') {
        this.synth[d.fn](...d.args);

        // Relay routing debug info back to main thread (Safari can't see worklet console)
        if (d.fn === 'set_custom_routing') {
          const snap = this.synth.debug_snapshot();
          this.port.postMessage({
            type: 'debug_routing',
            fn: d.fn,
            algo_name: snap.algo_name,
            algo_diagram: snap.algo_diagram,
            mod_depth_a: snap.mod_depth_a,
            mod_depth_b: snap.mod_depth_b,
            ratio_c: snap.ratio_c,
            ratio_a: snap.ratio_a,
            ratio_b1: snap.ratio_b1,
            ratio_b2: snap.ratio_b2,
            feedback: snap.feedback,
            carrier_mix: snap.carrier_mix,
            op_wave: snap.op_wave,
          });
        }
        // Relay feedback debug info when feedback is set
        if (d.fn === 'set_operator_feedback') {
          const snap = this.synth.debug_snapshot();
          this.port.postMessage({
            type: 'debug_feedback',
            opIndex: d.args[0],
            feedbackValue: d.args[1],
            op_sample: snap.op_sample,
          });
        }
      }
    };
  }

  process(_ins, outs) {
    if (!this.ready) return true;

    const outL = outs[0][0];
    const outR = outs[0][1];
    const buf = this.synth.process_sample_array();

    for (let i = 0; i < BLOCK; i++) {
      outL[i] = buf[i * 2];
      outR[i] = buf[i * 2 + 1];
    }

    return true;
  }
}

registerProcessor('synth-processor', SynthProcessor);

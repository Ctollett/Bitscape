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

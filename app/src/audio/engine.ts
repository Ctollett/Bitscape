let audioCtx: AudioContext | null = null;
let workletNode: AudioWorkletNode | null = null;
let ready = false;

export async function initAudio(): Promise<void> {
  if (audioCtx) {
    await audioCtx.resume();
    return;
  }

  audioCtx = new AudioContext();

  // Compile the WASM module on the main thread, pass it to the worklet
  const wasmBytes = await fetch('/wasm/synth_engine_bg.wasm').then((r) =>
    r.arrayBuffer()
  );
  const wasmModule = await WebAssembly.compile(wasmBytes);

  await audioCtx.audioWorklet.addModule('/synth_worklet.js');

  workletNode = new AudioWorkletNode(audioCtx, 'synth-processor', {
    outputChannelCount: [2],
    processorOptions: { wasmModule, sampleRate: audioCtx.sampleRate },
  });

  workletNode.connect(audioCtx.destination);

  return new Promise<void>((resolve) => {
    workletNode!.port.onmessage = (e) => {
      if (e.data.type === 'ready') {
        ready = true;
        // Init patch: clean sine, no effects
        setParam('set_delay_enabled', false);
        setParam('set_reverb_enabled', false);
        setParam('set_chorus_enabled', false);

        // Instant attack, full sustain, short release
        setParam('set_amp_env', 0, 0, 127, 10);

        // No FM modulation — pure carrier sine
        setParam('set_mod_depth_a', 0.0);
        setParam('set_mod_depth_b', 0.0);
        setParam('set_ratio_c', 1.0);
        resolve();
      }
    };
  });
}

export function noteOn(noteId: number, freq: number): void {
  if (!ready || !workletNode) return;
  workletNode.port.postMessage({ type: 'note_on', args: [noteId, freq] });
}

export function noteOff(noteId: number): void {
  if (!ready || !workletNode) return;
  workletNode.port.postMessage({ type: 'note_off', args: [noteId] });
}

export function setParam(fn: string, ...args: (number | boolean)[]): void {
  if (!ready || !workletNode) return;
  workletNode.port.postMessage({ type: 'param', fn, args });
}

export function isReady(): boolean {
  return ready;
}

let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8ArrayMemory0 = null;

function getUint8ArrayMemory0() {
    if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
        cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8ArrayMemory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}

let cachedUint32ArrayMemory0 = null;

function getUint32ArrayMemory0() {
    if (cachedUint32ArrayMemory0 === null || cachedUint32ArrayMemory0.byteLength === 0) {
        cachedUint32ArrayMemory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32ArrayMemory0;
}

let WASM_VECTOR_LEN = 0;

function passArray32ToWasm0(arg, malloc) {
    const ptr = malloc(arg.length * 4, 4) >>> 0;
    getUint32ArrayMemory0().set(arg, ptr / 4);
    WASM_VECTOR_LEN = arg.length;
    return ptr;
}

const SynthFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_synth_free(ptr >>> 0, 1));

export class Synth {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        SynthFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_synth_free(ptr, 0);
    }
    /**
     * @param {number} value
     */
    set_detune(value) {
        wasm.synth_set_detune(this.__wbg_ptr, value);
    }
    /**
     * @param {number} shift
     */
    set_octave(shift) {
        wasm.synth_set_octave(this.__wbg_ptr, shift);
    }
    /**
     * @param {number} v
     */
    set_volume(v) {
        wasm.synth_set_volume(this.__wbg_ptr, v);
    }
    /**
     * @param {number} attack
     * @param {number} decay
     * @param {number} sustain
     * @param {number} release
     */
    set_amp_env(attack, decay, sustain, release) {
        wasm.synth_set_amp_env(this.__wbg_ptr, attack, decay, sustain, release);
    }
    /**
     * @param {number} r
     */
    set_ratio_a(r) {
        wasm.synth_set_ratio_a(this.__wbg_ptr, r);
    }
    /**
     * @param {number} b1
     * @param {number} b2
     */
    set_ratio_b(b1, b2) {
        wasm.synth_set_ratio_b(this.__wbg_ptr, b1, b2);
    }
    /**
     * @param {number} r
     */
    set_ratio_c(r) {
        wasm.synth_set_ratio_c(this.__wbg_ptr, r);
    }
    /**
     * Delay time in milliseconds
     * @param {number} ms
     */
    set_delay_ms(ms) {
        wasm.synth_set_delay_ms(this.__wbg_ptr, ms);
    }
    /**
     * @param {number} fb
     */
    set_feedback(fb) {
        wasm.synth_set_feedback(this.__wbg_ptr, fb);
    }
    /**
     * @param {number} idx
     */
    set_algorithm(idx) {
        wasm.synth_set_algorithm(this.__wbg_ptr, idx);
    }
    /**
     * Delay wet/dry mix (0.0–1.0)
     * @param {number} mix
     */
    set_delay_mix(mix) {
        wasm.synth_set_delay_mix(this.__wbg_ptr, mix);
    }
    /**
     * @param {number} f
     */
    set_lfo1_fade(f) {
        wasm.synth_set_lfo1_fade(this.__wbg_ptr, f);
    }
    /**
     * @param {number} m
     */
    set_lfo1_mode(m) {
        wasm.synth_set_lfo1_mode(this.__wbg_ptr, m);
    }
    /**
     * @param {number} f
     */
    set_lfo2_fade(f) {
        wasm.synth_set_lfo2_fade(this.__wbg_ptr, f);
    }
    /**
     * @param {number} _m
     */
    set_lfo2_mode(_m) {
        wasm.synth_set_lfo2_mode(this.__wbg_ptr, _m);
    }
    /**
     * @param {number} drv
     */
    set_overdrive(drv) {
        wasm.synth_set_overdrive(this.__wbg_ptr, drv);
    }
    /**
     * @returns {any}
     */
    debug_snapshot() {
        const ret = wasm.synth_debug_snapshot(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} d
     */
    set_lfo1_depth(d) {
        wasm.synth_set_lfo1_depth(this.__wbg_ptr, d);
    }
    /**
     * @param {number} v
     */
    set_lfo1_speed(v) {
        wasm.synth_set_lfo1_speed(this.__wbg_ptr, v);
    }
    /**
     * @param {number} d
     */
    set_lfo2_depth(d) {
        wasm.synth_set_lfo2_depth(this.__wbg_ptr, d);
    }
    /**
     * @param {number} v
     */
    set_lfo2_speed(v) {
        wasm.synth_set_lfo2_speed(this.__wbg_ptr, v);
    }
    /**
     * @param {number} value
     */
    set_pitch_bend(value) {
        wasm.synth_set_pitch_bend(this.__wbg_ptr, value);
    }
    /**
     * @param {number} m
     */
    set_reverb_mix(m) {
        wasm.synth_set_reverb_mix(this.__wbg_ptr, m);
    }
    /**
     * @param {number} mix
     */
    set_carrier_mix(mix) {
        wasm.synth_set_carrier_mix(this.__wbg_ptr, mix);
    }
    /**
     * @param {number} ty
     */
    set_filter_type(ty) {
        wasm.synth_set_filter_type(this.__wbg_ptr, ty);
    }
    /**
     * @param {number} d
     */
    set_mod_depth_a(d) {
        wasm.synth_set_mod_depth_a(this.__wbg_ptr, d);
    }
    /**
     * @param {number} d
     */
    set_mod_depth_b(d) {
        wasm.synth_set_mod_depth_b(this.__wbg_ptr, d);
    }
    /**
     * @param {number} v
     */
    set_chorus_depth(v) {
        wasm.synth_set_chorus_depth(this.__wbg_ptr, v);
    }
    /**
     * LFO speed
     * @param {number} hz
     */
    set_chorus_speed(hz) {
        wasm.synth_set_chorus_speed(this.__wbg_ptr, hz);
    }
    /**
     * stereo spread
     * @param {number} w
     */
    set_chorus_width(w) {
        wasm.synth_set_chorus_width(this.__wbg_ptr, w);
    }
    /**
     * @param {number} v
     */
    set_filter_decay(v) {
        wasm.synth_set_filter_decay(this.__wbg_ptr, v);
    }
    /**
     * @param {number} d
     */
    set_reverb_decay(d) {
        wasm.synth_set_reverb_decay(this.__wbg_ptr, d);
    }
    /**
     * @param {boolean} on
     */
    set_delay_enabled(on) {
        wasm.synth_set_delay_enabled(this.__wbg_ptr, on);
    }
    /**
     * @param {number} v
     */
    set_filter_attack(v) {
        wasm.synth_set_filter_attack(this.__wbg_ptr, v);
    }
    /**
     * @param {number} hz
     */
    set_filter_cutoff(hz) {
        wasm.synth_set_filter_cutoff(this.__wbg_ptr, hz);
    }
    /**
     * @param {number} w
     */
    set_lfo1_waveform(w) {
        wasm.synth_set_lfo1_waveform(this.__wbg_ptr, w);
    }
    /**
     * @param {number} w
     */
    set_lfo2_waveform(w) {
        wasm.synth_set_lfo2_waveform(this.__wbg_ptr, w);
    }
    /**
     * Set harm for a specific operator (0-3) across all voices.
     * @param {number} op_index
     * @param {number} harm
     */
    set_operator_harm(op_index, harm) {
        wasm.synth_set_operator_harm(this.__wbg_ptr, op_index, harm);
    }
    /**
     * @param {boolean} on
     */
    set_chorus_enabled(on) {
        wasm.synth_set_chorus_enabled(this.__wbg_ptr, on);
    }
    /**
     * Accept arbitrary routing from the UI canvas.
     * `mod_flat`: flat pairs [src0, dst0, src1, dst1, ...]
     * `carrier_flat`: operator indices that output audio [op0, op1, ...]
     * @param {Uint32Array} mod_flat
     * @param {Uint32Array} carrier_flat
     */
    set_custom_routing(mod_flat, carrier_flat) {
        const ptr0 = passArray32ToWasm0(mod_flat, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        const ptr1 = passArray32ToWasm0(carrier_flat, wasm.__wbindgen_malloc);
        const len1 = WASM_VECTOR_LEN;
        wasm.synth_set_custom_routing(this.__wbg_ptr, ptr0, len0, ptr1, len1);
    }
    /**
     * Delay feedback (0.0–0.99)
     * @param {number} fb
     */
    set_delay_feedback(fb) {
        wasm.synth_set_delay_feedback(this.__wbg_ptr, fb);
    }
    /**
     * @param {number} v
     */
    set_filter_release(v) {
        wasm.synth_set_filter_release(this.__wbg_ptr, v);
    }
    /**
     * @param {number} v
     */
    set_filter_sustain(v) {
        wasm.synth_set_filter_sustain(this.__wbg_ptr, v);
    }
    /**
     * Set output level for a specific operator (0-3) across all voices.
     * @param {number} op_index
     * @param {number} level
     */
    set_operator_level(op_index, level) {
        wasm.synth_set_operator_level(this.__wbg_ptr, op_index, level);
    }
    /**
     * @param {number} d
     */
    set_reverb_damping(d) {
        wasm.synth_set_reverb_damping(this.__wbg_ptr, d);
    }
    /**
     * @param {boolean} on
     */
    set_reverb_enabled(on) {
        wasm.synth_set_reverb_enabled(this.__wbg_ptr, on);
    }
    /**
     * base delay in ms
     * @param {number} ms
     */
    set_chorus_delay_ms(ms) {
        wasm.synth_set_chorus_delay_ms(this.__wbg_ptr, ms);
    }
    /**
     * @param {number} m
     */
    set_lfo1_multiplier(m) {
        wasm.synth_set_lfo1_multiplier(this.__wbg_ptr, m);
    }
    /**
     * @param {number} m
     */
    set_lfo2_multiplier(m) {
        wasm.synth_set_lfo2_multiplier(this.__wbg_ptr, m);
    }
    /**
     * Set detune in cents for a specific operator (0-3) across all voices.
     * @param {number} op_index
     * @param {number} cents
     */
    set_operator_detune(op_index, cents) {
        wasm.synth_set_operator_detune(this.__wbg_ptr, op_index, cents);
    }
    /**
     * @param {number} time
     */
    set_portamento_time(time) {
        wasm.synth_set_portamento_time(this.__wbg_ptr, time);
    }
    /**
     * @param {number} mod1
     * @param {number} mod2
     */
    apply_lfo_modulation(mod1, mod2) {
        wasm.synth_apply_lfo_modulation(this.__wbg_ptr, mod1, mod2);
    }
    /**
     * @returns {Float32Array}
     */
    process_sample_array() {
        const ret = wasm.synth_process_sample_array(this.__wbg_ptr);
        return ret;
    }
    /**
     * @param {number} q
     */
    set_filter_resonance(q) {
        wasm.synth_set_filter_resonance(this.__wbg_ptr, q);
    }
    /**
     * @param {number} d
     */
    set_lfo1_destination(d) {
        wasm.synth_set_lfo1_destination(this.__wbg_ptr, d);
    }
    /**
     * @param {number} p
     */
    set_lfo1_start_phase(p) {
        wasm.synth_set_lfo1_start_phase(this.__wbg_ptr, p);
    }
    /**
     * @param {number} d
     */
    set_lfo2_destination(d) {
        wasm.synth_set_lfo2_destination(this.__wbg_ptr, d);
    }
    /**
     * @param {number} p
     */
    set_lfo2_start_phase(p) {
        wasm.synth_set_lfo2_start_phase(this.__wbg_ptr, p);
    }
    /**
     * Set mod envelope for a specific operator (0-3) across all voices.
     * @param {number} op_index
     * @param {number} attack
     * @param {number} decay
     * @param {number} end
     */
    set_operator_mod_env(op_index, attack, decay, end) {
        wasm.synth_set_operator_mod_env(this.__wbg_ptr, op_index, attack, decay, end);
    }
    /**
     * @param {number} range
     */
    set_pitch_bend_range(range) {
        wasm.synth_set_pitch_bend_range(this.__wbg_ptr, range);
    }
    /**
     * high-pass cutoff on the delayed signal
     * @param {number} hz
     */
    set_chorus_hpf_cutoff(hz) {
        wasm.synth_set_chorus_hpf_cutoff(this.__wbg_ptr, hz);
    }
    /**
     * @param {number} v
     */
    set_filter_env_amount(v) {
        wasm.synth_set_filter_env_amount(this.__wbg_ptr, v);
    }
    /**
     * Set feedback for a specific operator (0-3) across all voices.
     * @param {number} op_index
     * @param {number} feedback
     */
    set_operator_feedback(op_index, feedback) {
        wasm.synth_set_operator_feedback(this.__wbg_ptr, op_index, feedback);
    }
    /**
     * @param {number} op_index
     * @param {number} wave_type_id
     */
    set_operator_waveform(op_index, wave_type_id) {
        wasm.synth_set_operator_waveform(this.__wbg_ptr, op_index, wave_type_id);
    }
    /**
     * send amount into your global reverb
     * @param {number} s
     */
    set_chorus_reverb_send(s) {
        wasm.synth_set_chorus_reverb_send(this.__wbg_ptr, s);
    }
    /**
     * Initialize NUM_VOICES FM voices using the first algorithm by default
     * @param {number} sample_rate
     */
    constructor(sample_rate) {
        const ret = wasm.synth_new(sample_rate);
        this.__wbg_ptr = ret >>> 0;
        SynthFinalization.register(this, this.__wbg_ptr, this);
        return this;
    }
    /**
     * @param {number} note_id
     * @param {number} freq
     */
    note_on(note_id, freq) {
        wasm.synth_note_on(this.__wbg_ptr, note_id, freq);
    }
    /**
     * @param {number} p
     */
    set_pan(p) {
        wasm.synth_set_pan(this.__wbg_ptr, p);
    }
    /**
     * @param {number} note_id
     */
    note_off(note_id) {
        wasm.synth_note_off(this.__wbg_ptr, note_id);
    }
    /**
     * @param {number} h
     */
    set_harm(h) {
        wasm.synth_set_harm(this.__wbg_ptr, h);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_buffer_609cc3eee51ed158 = function(arg0) {
        const ret = arg0.buffer;
        return ret;
    };
    imports.wbg.__wbg_length_3b4f022188ae8db6 = function(arg0) {
        const ret = arg0.length;
        return ret;
    };
    imports.wbg.__wbg_log_c222819a41e063d3 = function(arg0) {
        console.log(arg0);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_e6b7e69acd4c7354 = function(arg0, arg1, arg2) {
        const ret = new Float32Array(arg0, arg1 >>> 0, arg2 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_newwithlength_5a5efe313cfd59f1 = function(arg0) {
        const ret = new Float32Array(arg0 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_random_3ad904d98382defe = function() {
        const ret = Math.random();
        return ret;
    };
    imports.wbg.__wbg_set_10bad9bee0e9c58b = function(arg0, arg1, arg2) {
        arg0.set(arg1, arg2 >>> 0);
    };
    imports.wbg.__wbindgen_init_externref_table = function() {
        const table = wasm.__wbindgen_export_0;
        const offset = table.grow(4);
        table.set(0, undefined);
        table.set(offset + 0, undefined);
        table.set(offset + 1, null);
        table.set(offset + 2, true);
        table.set(offset + 3, false);
        ;
    };
    imports.wbg.__wbindgen_json_parse = function(arg0, arg1) {
        const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return ret;
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return ret;
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedUint32ArrayMemory0 = null;
    cachedUint8ArrayMemory0 = null;


    wasm.__wbindgen_start();
    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;


    if (typeof module !== 'undefined') {
        if (Object.getPrototypeOf(module) === Object.prototype) {
            ({module} = module)
        } else {
            console.warn('using deprecated parameters for `initSync()`; pass a single object instead')
        }
    }

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(module_or_path) {
    if (wasm !== undefined) return wasm;


    if (typeof module_or_path !== 'undefined') {
        if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
            ({module_or_path} = module_or_path)
        } else {
            console.warn('using deprecated parameters for the initialization function; pass a single object instead')
        }
    }

    if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('synth_engine_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof module_or_path === 'string' || (typeof Request === 'function' && module_or_path instanceof Request) || (typeof URL === 'function' && module_or_path instanceof URL)) {
        module_or_path = fetch(module_or_path);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await module_or_path, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync };
export default __wbg_init;

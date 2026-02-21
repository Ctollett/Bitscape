use wasm_bindgen::prelude::*;
use js_sys::Float32Array;
use web_sys::console;

use serde::Serialize;
use wasm_bindgen::JsValue;


use crate::envelope::Envelope;
use crate::envelope_trait::EnvelopeTrait;
use crate::algorithm::{FMAlgorithm, get_algorithms};
use crate::voice::FMVoice;
use crate::filter::{Filter, FilterType};
use crate::effects::Effects;
use crate::lfo::{Lfo, LfoDestination, Waveform, LfoMode};

const BLOCK: usize = 128;
const NUM_VOICES: usize = 8;


#[derive(Serialize)]
struct DebugInfo {
    // ——— Envelopes ———
    amp_env:             f32,   // current amp envelope level
    op_wave:   [String; 4],   // “Sine” / “Square” / …
    op_sample: [f32;   4], 
    mod_env_a:           f32,   // current mod-env A level
    mod_env_b:           f32,   // current mod-env B level
    filter_env_amount:   f32,   // filter envelope amount

    algo_name:    String,
    algo_diagram: String,

    // ——— Frequency Ratios & Depths ———
    ratio_c:             f32,
    ratio_a:             f32,
    ratio_b1:            f32,
    ratio_b2:            f32,
    mod_depth_a:         f32,
    mod_depth_b:         f32,

    // ——— Global FM Params ———
    feedback:            f32,
    detune:              f32,
    carrier_mix:         f32,
    harm:                f32,

    // ——— Filter ———
    filter_cutoff:       f32,
    filter_resonance:    f32,

    // ——— Amp Section ———
    overdrive:           f32,
    pan:                 f32,
    volume:              f32,

    // ——— Chorus ———
    chorus_depth:        f32,
    chorus_speed:        f32,
    chorus_hpf_cutoff:   f32,
    chorus_width:        f32,
    chorus_delay_ms:     f32,
    chorus_reverb_send:  f32,

    // ——— Delay ———
    delay_ms:            f32,
    delay_feedback:      f32,
    delay_mix:           f32,

    // ——— Reverb ———
    reverb_decay:        f32,
    reverb_damping:      f32,
    reverb_mix:          f32,

    // ——— LFO 1 ———
    lfo1:                f32,   // current LFO1 output
    lfo1_speed:          f32,
    lfo1_multiplier:     f32,
    lfo1_fade:           f32,
    lfo1_destination:    String,
    lfo1_waveform:       String,
    lfo1_mode:           String,
    lfo1_depth:          f32,

    // ——— LFO 2 ———
    lfo2:                f32,   // current LFO2 output
    lfo2_speed:          f32,
    lfo2_multiplier:     f32,
    lfo2_fade:           f32,
    lfo2_destination:    String,
    lfo2_waveform:       String,
    lfo2_mode:           String,
    lfo2_depth:          f32,

    // ——— Final Samples ———
    last_sample_l:       f32,
    last_sample_r:       f32,
}




#[wasm_bindgen]
pub struct Synth {
    voices: Vec<FMVoice>,
    algorithms: Vec<FMAlgorithm>,
    sample_rate: f32,
    octave_shift: i32,
    current_algo: usize,   

    // FM parameters exposed to JS
    mod_depth_a: f32,
    mod_depth_b: f32,
    carrier_mix: f32,
    detune: f32,
    feedback: f32,
    ratio_c: f32,
    ratio_a: f32,
    ratio_b1: f32,
    ratio_b2: f32,
    harm: f32,
    lfo1: Lfo,
    lfo2: Lfo,
    chorus_enabled: bool,
    delay_enabled:  bool,
    reverb_enabled: bool,

    // Stereo filter pair (separate state for L and R)
    filter_l: Filter,
    filter_r: Filter,

    // Amp section parameters
    overdrive: f32,
    pan: f32,
    volume: f32,
    portamento_time: f32,
    last_note_frequency: f32,  // For portamento continuity across voices
    pitch_bend_range: f32,     // Pitch bend range in semitones (0-24)
    pitch_bend_value: f32,     // Current pitch bend (-1.0 to +1.0, where 0 = no bend)
    effects: Effects,
}

#[wasm_bindgen]
impl Synth {
    /// Initialize NUM_VOICES FM voices using the first algorithm by default
    #[wasm_bindgen(constructor)]
    pub fn new(sample_rate: f32) -> Synth {
        console::log_1(&format!("🔊 4-Op FM Synth @ {} Hz", sample_rate).into());

        // load all algorithms, pick the first as default
        let algorithms = get_algorithms();
        let default_algo = algorithms[0].clone();

        // build one FMVoice per poly voice
        let voices = (0..NUM_VOICES)
            .map(|_| FMVoice::new(sample_rate, default_algo.clone()))
            .collect();

        // init stereo filter pair
        let make_filter = || {
            let mut f = Filter::new(sample_rate);
            f.set_type(FilterType::LowPass);
            f.set_cutoff(20000.0);
            f.set_resonance(0.1);
            f
        };
        let filter_l = make_filter();
        let filter_r = make_filter();

        let effects = Effects::new(sample_rate);
        let lfo1 = Lfo::new(sample_rate);
        let lfo2 = Lfo::new(sample_rate);

        Synth {
            voices,
            algorithms,
            octave_shift: 0,
            sample_rate,
            mod_depth_a: 0.0,
            current_algo: 0, 
            mod_depth_b: 0.0,
            carrier_mix: 1.0,
            feedback: 0.0,
            ratio_c: 1.0,
            ratio_a: 1.0,
            ratio_b1: 0.25,
            ratio_b2: 0.25,
            harm: 0.0,
            detune: 0.0,
            filter_l,
            filter_r,
            overdrive: 0.0,
            pan: 0.0,
            volume: 127.0,
            portamento_time: 0.0,
            last_note_frequency: 440.0,
            pitch_bend_range: 2.0,  // Default 2 semitones (standard)
            pitch_bend_value: 0.0,   // No bend initially
            effects,
            lfo1,
            lfo2,
            chorus_enabled: true,
            delay_enabled:  true,
            reverb_enabled: true,
        }
    }

     // ——— Debug ———

     #[wasm_bindgen]
     pub fn debug_snapshot(&self) -> JsValue {
         // grab your first voice for envelopes & last output
         let voice = &self.voices[0];
         let (last_l, last_r) = voice.last_output();

         // Read the actual algorithm from voice 0 (reflects custom routing)
         let cur_algo     = &voice.algorithm;
         let algo_name    = cur_algo.name.to_string();
         let algo_diagram = format!(
             "mods: {:?}, carriers: {:?}, output: {:?}",
             cur_algo.modulations, cur_algo.carriers, cur_algo.output_routing
         );

         
         let op_wave = [
            format!("{:?}", voice.operators[0].osc.wave),
            format!("{:?}", voice.operators[1].osc.wave),
            format!("{:?}", voice.operators[2].osc.wave),
            format!("{:?}", voice.operators[3].osc.wave),

        ];
        let op_sample = [
            voice.operators[0].last_output,
            voice.operators[1].last_output,
            voice.operators[2].last_output,
            voice.operators[3].last_output,

        ];
     
         // pull out LFO settings
         let lfo1_dest = format!("{:?}", self.lfo1.destination);
         let lfo1_wave = format!("{:?}", self.lfo1.waveform());
         let lfo1_mode = format!("{:?}", self.lfo1.mode());
         let lfo2_dest = format!("{:?}", self.lfo2.destination);
         let lfo2_wave = format!("{:?}", self.lfo2.waveform());
         let lfo2_mode = format!("{:?}", self.lfo2.mode());
     
         // pull out effects settings
         let chorus = &self.effects.chorus;
         let delay  = &self.effects.delay;
         let reverb = &self.effects.reverb;
     
         let info = DebugInfo {
             // — Envelopes —
             op_wave,
             op_sample,
             amp_env:             voice.amp_envelope.get_level(),
             mod_env_a:           voice.operator_mod_envs[0].get_level(),  // Report op 0 for legacy compat
             mod_env_b:           voice.operator_mod_envs[2].get_level(),  // Report op 2 for legacy compat
             filter_env_amount:   self.filter_l.env_amount(),
             algo_name,
             algo_diagram,
     
             // — Ratios & Depths —
             ratio_c:             self.ratio_c,
             ratio_a:             self.ratio_a,
             ratio_b1:            self.ratio_b1,
             ratio_b2:            self.ratio_b2,
             mod_depth_a:         self.mod_depth_a,
             mod_depth_b:         self.mod_depth_b,
     
             // — Global FM Params —
             feedback:            self.feedback,
             detune:              self.detune,        // you’ll need to store last detune on Synth
             carrier_mix:         self.carrier_mix,
             harm:                self.harm,
     
             // — Filter —
             filter_cutoff:       self.filter_l.cutoff(),
             filter_resonance:    self.filter_l.resonance(),
     
             // — Amp Section —
             overdrive:           self.overdrive,
             pan:                 self.pan,
             volume:              self.volume,
     
             // — Chorus —
             chorus_depth:        chorus.get_depth(),
             chorus_speed:        chorus.get_speed(),
             chorus_hpf_cutoff:   chorus.get_hpf_cutoff(),
             chorus_width:        chorus.get_width(),
             chorus_delay_ms:     chorus.get_delay_ms(),
             chorus_reverb_send:  chorus.get_reverb_send(),
     
             // — Delay —
             delay_ms:            delay.get_delay_ms(),
             delay_feedback:      delay.get_feedback(),
             delay_mix:           delay.get_mix(),
     
             // — Reverb —
             reverb_decay:        reverb.get_decay(),
             reverb_damping:      reverb.get_damping(),
             reverb_mix:          reverb.get_mix(),
     
             // — LFO 1 —
             lfo1:                self.lfo1.current(),
             lfo1_speed:          self.lfo1.speed(),
             lfo1_multiplier:     self.lfo1.multiplier() as f32,
             lfo1_fade:           self.lfo1.fade() as f32,
             lfo1_destination:    lfo1_dest,
             lfo1_waveform:       lfo1_wave,
             lfo1_mode:           lfo1_mode,
             lfo1_depth:          self.lfo1.depth(),
     
             // — LFO 2 —
             lfo2:                self.lfo2.current(),
             lfo2_speed:          self.lfo2.speed(),
             lfo2_multiplier:     self.lfo2.multiplier() as f32,
             lfo2_fade:           self.lfo2.fade() as f32,
             lfo2_destination:    lfo2_dest,
             lfo2_waveform:       lfo2_wave,
             lfo2_mode:           lfo2_mode,
             lfo2_depth:          self.lfo2.depth(),
     
             // — Final Samples —
             last_sample_l:       last_l,
             last_sample_r:       last_r,
         };
     
         JsValue::from_serde(&info).unwrap()
     }
     

    // ——— FM parameter setters ———

    #[wasm_bindgen]
    pub fn set_mod_depth_a(&mut self, d: f32) { self.mod_depth_a = d.clamp(0.0, 127.0); }

    #[wasm_bindgen]
    pub fn set_mod_depth_b(&mut self, d: f32) { self.mod_depth_b = d.clamp(0.0, 127.0); }

    #[wasm_bindgen]
pub fn set_octave(&mut self, shift: i32) {
    let s = shift.clamp(-4, 4);
    self.octave_shift = s;
    for v in &mut self.voices {
        v.set_octave_shift(s);
    }
}

    /// Set mod envelope for a specific operator (0-3) across all voices.
    #[wasm_bindgen]
    pub fn set_operator_mod_env(&mut self, op_index: usize, attack: u32, decay: u32, end: u32) {
        if op_index >= 4 { return; }
        for v in &mut self.voices {
            v.set_operator_mod_env(op_index, attack, decay, end);
        }
    }

    // in Synth's #[wasm_bindgen] impl
#[wasm_bindgen]
pub fn set_amp_env(&mut self,
    attack: u8,    // 0–127
    decay: u8,     // 0–127
    sustain: u8,   // 0–127
    release: u8    // 0–127
) {
    // Update parameters without resetting envelope state/level
    let a = Envelope::map_time(attack);
    let d = Envelope::map_time(decay);
    let s = sustain as f32 / 127.0;
    let r = Envelope::map_time(release);
    for voice in &mut self.voices {
        voice.set_attack(a);
        voice.set_decay(d);
        voice.set_sustain(s);
        voice.set_release(r);
    }
}


    #[wasm_bindgen]
    pub fn set_detune(&mut self, value: f32) {
        for v in &mut self.voices { v.apply_detune(value); }
    }

    #[wasm_bindgen]
    pub fn set_feedback(&mut self, fb: f32) {
        self.feedback = fb;
        for v in &mut self.voices { v.set_global_feedback(fb); }
    }

    /// Set feedback for a specific operator (0-3) across all voices.
    #[wasm_bindgen]
    pub fn set_operator_feedback(&mut self, op_index: usize, feedback: f32) {
        if op_index >= 4 { return; }
        for v in &mut self.voices {
            v.set_operator_feedback(op_index, feedback);
        }
    }

    /// Set detune in cents for a specific operator (0-3) across all voices.
    #[wasm_bindgen]
    pub fn set_operator_detune(&mut self, op_index: usize, cents: f32) {
        if op_index >= 4 { return; }
        for v in &mut self.voices {
            v.set_operator_detune(op_index, cents);
        }
    }

    /// Set harm for a specific operator (0-3) across all voices.
    #[wasm_bindgen]
    pub fn set_operator_harm(&mut self, op_index: usize, harm: f32) {
        if op_index >= 4 { return; }
        for v in &mut self.voices {
            v.set_operator_harm(op_index, harm);
        }
    }

    /// Set output level for a specific operator (0-3) across all voices.
    #[wasm_bindgen]
    pub fn set_operator_level(&mut self, op_index: usize, level: f32) {
        if op_index >= 4 { return; }
        for v in &mut self.voices {
            v.set_operator_level(op_index, level);
        }
    }

    #[wasm_bindgen]
    pub fn set_harm(&mut self, h: f32) {
        self.harm = h;
        for v in &mut self.voices { v.update_harm(h); }
    }

    #[wasm_bindgen]
    pub fn set_algorithm(&mut self, idx: usize) {
        if idx >= self.algorithms.len() { return; }      // guard
        let algo = self.algorithms[idx].clone();
        for v in &mut self.voices { v.set_algorithm(algo.clone()); }
        self.current_algo = idx;                         //  ← remember it
    }

    /// Accept arbitrary routing from the UI canvas.
    /// `mod_flat`: flat pairs [src0, dst0, src1, dst1, ...]
    /// `carrier_flat`: operator indices that output audio [op0, op1, ...]
    #[wasm_bindgen]
    pub fn set_custom_routing(&mut self, mod_flat: &[u32], carrier_flat: &[u32]) {
        let modulations: Vec<(usize, usize)> = mod_flat
            .chunks(2)
            .filter(|c| c.len() == 2 && (c[0] as usize) < 4 && (c[1] as usize) < 4)
            .map(|c| (c[0] as usize, c[1] as usize))
            .collect();

        let carriers: Vec<usize> = carrier_flat.iter()
            .map(|&op| op as usize)
            .filter(|&op| op < 4)
            .collect();

        let algo = FMAlgorithm::custom(modulations.clone(), carriers.clone());

        let mod_str: Vec<String> = modulations.iter().map(|(s,d)| format!("{}→{}", s, d)).collect();
        let carrier_str: Vec<String> = carriers.iter().map(|c| c.to_string()).collect();
        let out_str: Vec<String> = algo.output_routing.iter().map(|(op,ch)| format!("op{}→{}", op, ch)).collect();
        console::log_1(&format!(
            "[engine] set_custom_routing — mods: [{}], carriers: [{}], output: [{}]",
            mod_str.join(", "),
            carrier_str.join(", "),
            out_str.join(", "),
        ).into());

        for v in &mut self.voices { v.set_algorithm(algo.clone()); }
    }
    

    // ——— Note handling ———

    #[wasm_bindgen]
    pub fn note_on(&mut self, note_id: u32, freq: f32) {
        // 1) If this note_id is already playing, reuse that voice
        let idx = if let Some(i) = self.voices.iter().position(|v| v.get_note_id() == Some(note_id)) {
            i
        // 2) Find a free (inactive) voice
        } else if let Some(i) = self.voices.iter().position(|v| !v.is_active()) {
            i
        // 3) Prefer stealing a releasing voice (active but no note_id)
        } else if let Some(i) = self.voices.iter().position(|v| !v.is_held()) {
            i
        // 4) All voices held — steal the oldest held voice
        } else {
            self.voices.iter().enumerate()
                .min_by_key(|(_, v)| v.get_note_id().unwrap_or(u32::MAX))
                .map(|(i, _)| i)
                .unwrap_or(0)
        };

        // Check if any voices are active BEFORE triggering new note (for legato detection)
        let any_active = self.voices.iter().any(|v| v.is_active());

        // Pass last note frequency and active state for portamento continuity
        let pitch_mul = 2_f32.powi(self.octave_shift);
        let adjusted_freq = freq * pitch_mul;
        self.voices[idx].note_on(note_id, freq, self.last_note_frequency, any_active);
        self.last_note_frequency = adjusted_freq;  // Track for next note

        if !any_active {
            self.filter_l.note_on();
            self.filter_r.note_on();
        }
    }

    #[wasm_bindgen]
    pub fn note_off(&mut self, note_id: u32) {
        // Find the voice playing this note_id
        if let Some(i) = self.voices.iter().position(|v| v.get_note_id() == Some(note_id)) {
            self.voices[i].note_off(note_id);
        }
        // Only release filter envelope when no voices are still held
        let any_held = self.voices.iter().any(|v| v.is_held());
        if !any_held {
            self.filter_l.note_off();
            self.filter_r.note_off();
        }
    }

    // ——— Carrier mix ———
    #[wasm_bindgen]
    pub fn set_carrier_mix(&mut self, mix: f32) {
        self.carrier_mix = mix.clamp(0.0, 1.0);
    }


    // ——— Filter setters ———

    #[wasm_bindgen]
    pub fn set_filter_type(&mut self, ty: usize) {
        let ft = if ty == 1 { FilterType::HighPass } else { FilterType::LowPass };
        self.filter_l.set_type(ft);
        self.filter_r.set_type(ft);
    }

    #[wasm_bindgen]
    pub fn set_filter_cutoff(&mut self, hz: f32) { self.filter_l.set_cutoff(hz); self.filter_r.set_cutoff(hz); }

    #[wasm_bindgen]
    pub fn set_filter_resonance(&mut self, q: f32) { self.filter_l.set_resonance(q); self.filter_r.set_resonance(q); }

    #[wasm_bindgen]
    pub fn set_filter_attack(&mut self, v: f32) { self.filter_l.set_attack(v); self.filter_r.set_attack(v); }
    #[wasm_bindgen]
    pub fn set_filter_decay(&mut self, v: f32) { self.filter_l.set_decay(v); self.filter_r.set_decay(v); }
    #[wasm_bindgen]
    pub fn set_filter_sustain(&mut self, v: f32) { self.filter_l.set_sustain(v); self.filter_r.set_sustain(v); }
    #[wasm_bindgen]
    pub fn set_filter_release(&mut self, v: f32) { self.filter_l.set_release(v); self.filter_r.set_release(v); }
    #[wasm_bindgen]
    pub fn set_filter_env_amount(&mut self, v: f32) { self.filter_l.set_env_amount(v); self.filter_r.set_env_amount(v); }

    // ——— Amp section setters ———

    #[wasm_bindgen]
    pub fn set_overdrive(&mut self, drv: f32) {
        self.overdrive = drv.clamp(0.0, 127.0);
    }

    #[wasm_bindgen]
    pub fn set_pan(&mut self, p: f32) {
        self.pan = p.clamp(-64.0, 63.0);
    }

    #[wasm_bindgen]
    pub fn set_volume(&mut self, v: f32) {
        self.volume = v.clamp(0.0, 127.0);
    }

    #[wasm_bindgen]
    pub fn set_portamento_time(&mut self, time: f32) {
        self.portamento_time = time.clamp(0.0, 127.0);
        for v in &mut self.voices {
            v.set_portamento_time(time);
        }
    }

    #[wasm_bindgen]
    pub fn set_pitch_bend_range(&mut self, range: f32) {
        self.pitch_bend_range = range.clamp(0.0, 24.0);
        // Recalculate pitch bend multiplier with new range
        self.apply_pitch_bend();
    }

    #[wasm_bindgen]
    pub fn set_pitch_bend(&mut self, value: f32) {
        // Value should be -1.0 (full down) to +1.0 (full up), with 0.0 = center
        self.pitch_bend_value = value.clamp(-1.0, 1.0);
        self.apply_pitch_bend();
    }

    /// Internal helper to calculate and apply pitch bend to all voices
    fn apply_pitch_bend(&mut self) {
        // Calculate semitone offset: bend_value (-1 to +1) * range (in semitones)
        let semitones = self.pitch_bend_value * self.pitch_bend_range;
        // Convert semitones to frequency multiplier: 2^(semitones/12)
        let multiplier = 2_f32.powf(semitones / 12.0);

        // Apply to all voices
        for voice in &mut self.voices {
            voice.set_pitch_bend_multiplier(multiplier);
        }
    }

    #[wasm_bindgen]
    pub fn set_chorus_depth(&mut self, v: f32) {
        self.effects.chorus.set_depth(v);
    }
    /// LFO speed
    #[wasm_bindgen]
    pub fn set_chorus_speed(&mut self, hz: f32) {
        self.effects.chorus.set_speed(hz);
    }
    /// high-pass cutoff on the delayed signal
    #[wasm_bindgen]
    pub fn set_chorus_hpf_cutoff(&mut self, hz: f32) {
        self.effects.chorus.set_hpf_cutoff(hz);
    }
    /// stereo spread
    #[wasm_bindgen]
    pub fn set_chorus_width(&mut self, w: f32) {
        self.effects.chorus.set_width(w);
    }
    /// base delay in ms
    #[wasm_bindgen]
    pub fn set_chorus_delay_ms(&mut self, ms: f32) {
        self.effects.chorus.set_delay_ms(ms);
    }
    /// send amount into your global reverb
    #[wasm_bindgen]
    pub fn set_chorus_reverb_send(&mut self, s: f32) {
        self.effects.chorus.set_reverb_send(s);
    }

        /// Delay time in milliseconds
        #[wasm_bindgen]
        pub fn set_delay_ms(&mut self, ms: f32) {
            self.effects.delay.set_delay_ms(ms);
        }
    
        /// Delay feedback (0.0–0.99)
        #[wasm_bindgen]
        pub fn set_delay_feedback(&mut self, fb: f32) {
            self.effects.delay.set_feedback(fb);
        }
    
        /// Delay wet/dry mix (0.0–1.0)
        #[wasm_bindgen]
        pub fn set_delay_mix(&mut self, mix: f32) {
            self.effects.delay.set_mix(mix);
        }

        #[wasm_bindgen]
pub fn set_reverb_decay(&mut self, d: f32) {
    self.effects.reverb.set_decay(d);
}
#[wasm_bindgen]
pub fn set_reverb_damping(&mut self, d: f32) {
    self.effects.reverb.set_damping(d);
}
#[wasm_bindgen]
pub fn set_reverb_mix(&mut self, m: f32) {
    self.effects.reverb.set_mix(m);
}

#[wasm_bindgen]
pub fn set_chorus_enabled(&mut self, on: bool) {
    self.chorus_enabled = on;
}

#[wasm_bindgen]
pub fn set_delay_enabled(&mut self, on: bool) {
    self.delay_enabled = on;
}

#[wasm_bindgen]
pub fn set_reverb_enabled(&mut self, on: bool) {
    self.reverb_enabled = on;
}


#[wasm_bindgen]
pub fn set_ratio_c(&mut self, r: f32) {
    self.ratio_c = r;
    for v in &mut self.voices {
        v.set_ratio_c(r);
    }
}

#[wasm_bindgen]
pub fn set_ratio_a(&mut self, r: f32) {
    self.ratio_a = r;
    for v in &mut self.voices {
        v.set_ratio_a(r);
    }
}

#[wasm_bindgen]
pub fn set_ratio_b(&mut self, b1: f32, b2: f32) {
    self.ratio_b1 = b1;
    self.ratio_b2 = b2;
    for v in &mut self.voices {
        v.set_ratio_b(b1, b2);
    }
}


    // —— LFO1 parameter setters ——
    #[wasm_bindgen]
    pub fn set_lfo1_speed(&mut self, v: f32) {
        self.lfo1.set_speed(v);
    }
    #[wasm_bindgen]
    pub fn set_lfo1_multiplier(&mut self, m: i32) {
        self.lfo1.set_multiplier(m);
    }
    #[wasm_bindgen]
    pub fn set_lfo1_fade(&mut self, f: i32) {
        self.lfo1.set_fade(f);
    }
    #[wasm_bindgen]
    pub fn apply_lfo_modulation(&mut self, mod1: f32, mod2: f32) {
        let dest1 = self.lfo1.destination;
        let dest2 = self.lfo2.destination;
        // Route global synth params and per-voice
        self.route_lfo(mod1, dest1);
        self.route_lfo(mod2, dest2);
    }

    fn route_lfo(&mut self, value: f32, dest: LfoDestination) {
        match dest {
            // ----- Synth-level parameters -----
            LfoDestination::ModDepthA => self.mod_depth_a += value,
            LfoDestination::ModDepthB => self.mod_depth_b += value,
            LfoDestination::Feedback  => self.feedback    += value,
            LfoDestination::Harm      => self.harm        += value,
            LfoDestination::CarrierMix=> self.carrier_mix += value,

            LfoDestination::Overdrive => self.overdrive   += value,
            LfoDestination::Pan       => self.pan         += value,
            LfoDestination::Volume    => self.volume      += value,

            // ----- Filter parameters -----
            LfoDestination::FilterCutoff => {
                let v = self.filter_l.cutoff() + value;
                self.filter_l.set_cutoff(v); self.filter_r.set_cutoff(v);
            }
            LfoDestination::FilterResonance => {
                let v = self.filter_l.resonance() + value;
                self.filter_l.set_resonance(v); self.filter_r.set_resonance(v);
            }
            LfoDestination::FilterEnvAmount => {
                let v = self.filter_l.env_amount() + value;
                self.filter_l.set_env_amount(v); self.filter_r.set_env_amount(v);
            }
            LfoDestination::FilterAttack => {
                let v = self.filter_l.attack() + value;
                self.filter_l.set_attack(v); self.filter_r.set_attack(v);
            }
            LfoDestination::FilterDecay => {
                let v = self.filter_l.decay() + value;
                self.filter_l.set_decay(v); self.filter_r.set_decay(v);
            }
            LfoDestination::FilterSustain => {
                let v = self.filter_l.sustain() + value;
                self.filter_l.set_sustain(v); self.filter_r.set_sustain(v);
            }
            LfoDestination::FilterRelease => {
                let v = self.filter_l.release() + value;
                self.filter_l.set_release(v); self.filter_r.set_release(v);
            }

            // ----- Voice-level parameters -----
            LfoDestination::RatioA     |
            LfoDestination::RatioB     |
            LfoDestination::RatioC     |
            LfoDestination::AmpAttack  |
            LfoDestination::AmpDecay   |
            LfoDestination::AmpSustain |
            LfoDestination::AmpRelease => {
                for voice in &mut self.voices {
                    voice.apply_lfo(dest, value);
                }
            }
        }
    }
    #[wasm_bindgen]
    pub fn set_lfo1_waveform(&mut self, w: u32) {
        let wf = match w {
            0 => Waveform::Triangle,
            1 => Waveform::Sine,
            2 => Waveform::Square,
            3 => Waveform::Sawtooth,
            4 => Waveform::Exponential,
            5 => Waveform::Ramp,
            6 => Waveform::Random,
            _ => Waveform::Triangle,
        };
        self.lfo1.set_waveform(wf);
    }

    #[wasm_bindgen]
pub fn set_lfo1_destination(&mut self, d: u32) {
    let dest = match d {
        0  => LfoDestination::ModDepthA,
        1  => LfoDestination::ModDepthB,
        2  => LfoDestination::RatioC,
        3  => LfoDestination::RatioA,
        4  => LfoDestination::RatioB,
        5  => LfoDestination::Feedback,
        6  => LfoDestination::Harm,
        7  => LfoDestination::CarrierMix,
        8  => LfoDestination::AmpAttack,
        9  => LfoDestination::AmpDecay,
        10 => LfoDestination::AmpSustain,
        11 => LfoDestination::AmpRelease,
        12 => LfoDestination::Overdrive,
        13 => LfoDestination::Pan,
        14 => LfoDestination::Volume,
        15 => LfoDestination::FilterAttack,
        16 => LfoDestination::FilterDecay,
        17 => LfoDestination::FilterSustain,
        18 => LfoDestination::FilterRelease,
        19 => LfoDestination::FilterCutoff,
        20 => LfoDestination::FilterResonance,
        21 => LfoDestination::FilterEnvAmount,
        _  => LfoDestination::ModDepthA,
    };
    self.lfo1.set_destination(dest);
}

#[wasm_bindgen]
pub fn set_lfo2_destination(&mut self, d: u32) {
    let dest = match d {
        0  => LfoDestination::ModDepthA,
        1  => LfoDestination::ModDepthB,
        2  => LfoDestination::RatioC,
        3  => LfoDestination::RatioA,
        4  => LfoDestination::RatioB,
        5  => LfoDestination::Feedback,
        6  => LfoDestination::Harm,
        7  => LfoDestination::CarrierMix,
        8  => LfoDestination::AmpAttack,
        9  => LfoDestination::AmpDecay,
       10  => LfoDestination::AmpSustain,
       11  => LfoDestination::AmpRelease,
       12  => LfoDestination::Overdrive,
       13  => LfoDestination::Pan,
       14  => LfoDestination::Volume,
       15  => LfoDestination::FilterAttack,
       16  => LfoDestination::FilterDecay,
       17  => LfoDestination::FilterSustain,
       18  => LfoDestination::FilterRelease,
       19  => LfoDestination::FilterCutoff,
       20  => LfoDestination::FilterResonance,
       21  => LfoDestination::FilterEnvAmount,
       _   => LfoDestination::ModDepthA,
    };
    self.lfo2.set_destination(dest);
}

#[wasm_bindgen]
pub fn set_lfo2_waveform(&mut self, w: u32) {
    let wf = match w {
        0 => Waveform::Triangle,
        1 => Waveform::Sine,
        2 => Waveform::Square,
        3 => Waveform::Sawtooth,
        4 => Waveform::Exponential,
        5 => Waveform::Ramp,
        6 => Waveform::Random,
        _ => Waveform::Triangle,
    };
    self.lfo2.set_waveform(wf);
}

  #[wasm_bindgen]
  pub fn set_operator_waveform(&mut self, op_index: usize, wave_type_id: u8) {
      if op_index >= 4 { return; }
      for voice in &mut self.voices {
          voice.set_operator_waveform(op_index, wave_type_id);
      }
  }



    #[wasm_bindgen]
    pub fn set_lfo1_start_phase(&mut self, p: f32) {
        self.lfo1.set_start_phase(p);
    }
    #[wasm_bindgen]
    pub fn set_lfo1_mode(&mut self, m: u32) {
        let mode = match m {
            0 => LfoMode::Free,
            1 => LfoMode::Trigger,
            2 => LfoMode::Hold,
            3 => LfoMode::One,
            4 => LfoMode::Half,
            _ => LfoMode::Free,
        };
        self.lfo1.set_mode(mode);
    }
    #[wasm_bindgen]
    pub fn set_lfo1_depth(&mut self, d: f32) {
        self.lfo1.set_depth(d);
    }

    // —— LFO2 parameter setters ——
    #[wasm_bindgen]
    pub fn set_lfo2_speed(&mut self, v: f32) { self.lfo2.set_speed(v); }
    #[wasm_bindgen]
    pub fn set_lfo2_multiplier(&mut self, m: i32) { self.lfo2.set_multiplier(m); }
    #[wasm_bindgen]
    pub fn set_lfo2_fade(&mut self, f: i32) { self.lfo2.set_fade(f); }

    #[wasm_bindgen]
    pub fn set_lfo2_start_phase(&mut self, p: f32) { self.lfo2.set_start_phase(p); }
    #[wasm_bindgen]
    pub fn set_lfo2_mode(&mut self, _m: u32) { /* … */ }
    #[wasm_bindgen]
    pub fn set_lfo2_depth(&mut self, d: f32) { self.lfo2.set_depth(d); }

    

    // ——— Audio rendering ———
    #[wasm_bindgen]
    pub fn process_sample_array(&mut self) -> Float32Array {
        let mut out = Vec::with_capacity(BLOCK * 2);
        let dt = 1.0 / self.sample_rate;
        use std::f32::consts::FRAC_PI_4;
    
        // ─── Advance LFOs and apply their modulation ───
        // Save base values so LFO modulation doesn't accumulate across blocks
        let base_mod_depth_a = self.mod_depth_a;
        let base_mod_depth_b = self.mod_depth_b;
        let base_feedback    = self.feedback;
        let base_harm        = self.harm;
        let base_carrier_mix = self.carrier_mix;
        let base_overdrive   = self.overdrive;
        let base_pan         = self.pan;
        let base_volume      = self.volume;

        let mod1 = self.lfo1.process(dt);
        let mod2 = self.lfo2.process(dt);
        self.apply_lfo_modulation(mod1, mod2);

        // Clamp modulated values to valid ranges
        self.mod_depth_a = self.mod_depth_a.clamp(0.0, 1.0);
        self.mod_depth_b = self.mod_depth_b.clamp(0.0, 1.0);
        self.carrier_mix = self.carrier_mix.clamp(0.0, 1.0);
        self.volume      = self.volume.clamp(0.0, 127.0);
    
        for _ in 0..BLOCK {
            // 1) Mix all voices
            let mut l = 0.0;
            let mut r = 0.0;
            for v in &mut self.voices {
                let (vl, vr) = v.generate_sample(
                    dt,
                    self.mod_depth_a,
                    self.mod_depth_b,
                    self.carrier_mix,
                );
                l += vl;
                r += vr;
            }
    
            // 2) Overdrive (tanh driver)
            let drive_gain = 1.0 + (self.overdrive / 127.0) * 9.0;
            l = (l * drive_gain).tanh();
            r = (r * drive_gain).tanh();
    
            // 3) Multimode filter (separate L/R state)
            let lf = self.filter_l.process(l, dt);
            let rf = self.filter_r.process(r, dt);
    
            // 4) Stereo pan (equal-power law)
            let pan_norm = (self.pan / 63.0).clamp(-1.0, 1.0);
            let angle = (pan_norm + 1.0) * FRAC_PI_4; // maps [-1..+1] → [0..π/2]
            let pan_l = angle.cos();
            let pan_r = angle.sin();
            let lp = lf * pan_l;
            let rp = rf * pan_r;
    
            // 5) Master volume
            let vol = (self.volume / 127.0).clamp(0.0, 1.0);
            l = lp * vol;
            r = rp * vol;
    
            // 6) Global effects chain, gated by your new flags
            if self.chorus_enabled {
                let (cl, cr) = self.effects.chorus.process(l, r, dt);
                l = cl; r = cr;
            }
            if self.delay_enabled {
                let (dl, dr) = self.effects.delay.process(l, r, dt);
                l = dl; r = dr;
            }
            if self.reverb_enabled {
                let (rl, rr) = self.effects.reverb.process(l, r, dt);
                l = rl; r = rr;
            }
    
            out.push(l);
            out.push(r);
        }
    
        // Restore base values (undo LFO modulation so it doesn't accumulate)
        self.mod_depth_a = base_mod_depth_a;
        self.mod_depth_b = base_mod_depth_b;
        self.feedback    = base_feedback;
        self.harm        = base_harm;
        self.carrier_mix = base_carrier_mix;
        self.overdrive   = base_overdrive;
        self.pan         = base_pan;
        self.volume      = base_volume;

        // Package into a Float32Array for JS
        let array = Float32Array::new_with_length((BLOCK * 2) as u32);
        array.copy_from(&out);
        array
    }
}
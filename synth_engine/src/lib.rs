use std::collections::HashMap;
use wasm_bindgen::prelude::*;

pub mod oscillator;
pub mod operator;
pub mod algorithm;
pub mod effects;
pub mod envelope;
pub mod voice;

use crate::oscillator::WaveType;
use crate::operator::FMOperator;
use crate::effects::delay::Delay;
use crate::algorithm::{FMAlgorithm, get_algorithms};
use crate::voice::FMVoice;

#[wasm_bindgen]
pub struct Synth {
    voices: Vec<FMVoice>,
    current_algorithm: usize, // 0 for Algorithm 0, 1 for Algorithm 1, etc.
    delay: Delay,
    sample_rate: f32,
    active_voices: HashMap<u32, usize>, // Maps note_id to voice index
    carrier_mix: f32,
    mod_level_a: f32,   // New: Level for group A modulators.
    mod_level_b: f32,
}

#[wasm_bindgen]
impl Synth {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Synth {
        let sample_rate = 44100.0;
        let default_algo = get_algorithms()[0].clone();
        let mut voices = Vec::new();
        
        // Create 8 voices for polyphony.
        for _ in 0..8 {
            voices.push(FMVoice::new(sample_rate, default_algo.clone()));
        }

        Synth {
            voices,
            current_algorithm: 0,
            delay: Delay::new(sample_rate, 0.0, 0.0, 0.0),
            sample_rate,
            active_voices: HashMap::new(),
            carrier_mix: 0.5,
            mod_level_a: 1.0,
            mod_level_b: 1.0,
        }
    }

    /// Note-on: Allocate a voice and register the note_id.
    #[wasm_bindgen]
    pub fn note_on(&mut self, note_id: u32, frequency: f32) {
        if let Some(&voice_index) = self.active_voices.get(&note_id) {
            self.voices[voice_index].note_on(note_id, frequency);
            web_sys::console::log_1(
                &format!("Note on (retrigger): {} Hz, note id: {}", frequency, note_id).into(),
            );
            return;
        }

        // Find an inactive voice to allocate.
        for (i, voice) in self.voices.iter_mut().enumerate() {
            if !voice.is_active() {
                voice.note_on(note_id, frequency);
                self.active_voices.insert(note_id, i);
                web_sys::console::log_1(
                    &format!("Note on: {} Hz, note id: {}", frequency, note_id).into(),
                );
                return;
            }
        }

        // If all voices are active, steal the first one.
        if let Some(voice) = self.voices.get_mut(0) {
            if let Some(prev_note_id) = voice.get_note_id() {
                self.active_voices.remove(&prev_note_id);
            }
            voice.note_on(note_id, frequency);
            self.active_voices.insert(note_id, 0);
            web_sys::console::log_1(
                &format!("Note on (voice steal): {} Hz, note id: {}", frequency, note_id).into(),
            );
        }
    }

    /// Note-off: Look up the voice index by note_id and send note_off.
    #[wasm_bindgen]
    pub fn note_off(&mut self, note_id: u32) {
        if let Some(&voice_index) = self.active_voices.get(&note_id) {
            self.voices[voice_index].note_off(note_id);
            self.active_voices.remove(&note_id);
            web_sys::console::log_1(&format!("Note off, note id: {}", note_id).into());
        }
    }
    
    /// Set the FM algorithm for all voices.
    #[wasm_bindgen]
    pub fn set_algorithm(&mut self, algo_index: usize) {
        let example_algos = get_algorithms();
        let index = algo_index % example_algos.len();
        web_sys::console::log_1(&format!("Algorithm set to index: {}", index).into());
        
        let new_algo = example_algos[index].clone();
        for voice in self.voices.iter_mut() {
            voice.set_algorithm(new_algo.clone());
        }
    }

    #[wasm_bindgen]
    pub fn set_carrier_mix(&mut self, mix: f32) {
        self.carrier_mix = mix;
        web_sys::console::log_1(&format!("Carrier mix set to {}", mix).into());
    }

    #[wasm_bindgen]
    pub fn set_mod_level_a(&mut self, level: f32) {
        self.mod_level_a = level;
        web_sys::console::log_1(&format!("Modulator level for group A set to {}", level).into());
    }

    /// Set the modulation level for group B modulators.
    #[wasm_bindgen]
    pub fn set_mod_level_b(&mut self, level: f32) {
        self.mod_level_b = level;
        web_sys::console::log_1(&format!("Modulator level for group B set to {}", level).into());
    }
    
    /// Process one sample by mixing all active voices and applying the delay.
    #[wasm_bindgen]
    pub fn process_sample(&mut self) -> f32 {
        let delta_time = 1.0 / self.sample_rate;
        let mut mixed_sample = 0.0;
        let mut active_count = 0;

        // Process each active voice separately.
        for voice in self.voices.iter_mut() {
            if voice.is_active() {
                let voice_output = voice.generate_sample(delta_time);
                mixed_sample += voice_output;
                active_count += 1;
            }
        }

        if active_count > 0 {
            mixed_sample /= active_count as f32;
        }

        self.delay.process_sample(mixed_sample)
    }


    /// Update the frequency ratio for a given operator group.
    ///
    /// The `group` parameter should be one of:
    /// - "C" → update operator 0,
    /// - "A" → update operator 2,
    /// - "B" → update both operators 1 and 3.
    #[wasm_bindgen]
    pub fn update_operator_ratio(&mut self, group: &str, ratio: f32) {
        match group {
            "C" => {
                for voice in &mut self.voices {
                    voice.operators[0].set_frequency_ratio(ratio);
                }
                web_sys::console::log_1(
                    &format!("Updated frequency ratio for group C to {}", ratio).into()
                );
            },
            "A" => {
                for voice in &mut self.voices {
                    voice.operators[2].set_frequency_ratio(ratio);
                }
                web_sys::console::log_1(
                    &format!("Updated frequency ratio for group A to {}", ratio).into()
                );
            },
            "B" => {
                for voice in &mut self.voices {
                    // Group B consists of both operators 1 and 3.
                    voice.operators[1].set_frequency_ratio(ratio);
                    voice.operators[3].set_frequency_ratio(ratio);
                }
                web_sys::console::log_1(
                    &format!("Updated frequency ratio for group B to {}", ratio).into()
                );
            },
            _ => {
                web_sys::console::log_1(&"Invalid operator group!".into());
            },
        }
    }

    /// Log the current frequency ratio for a given group.
    #[wasm_bindgen]
    pub fn log_operator_ratio(&self, group: &str) {
        match group {
            "C" => {
                if let Some(voice) = self.voices.get(0) {
                    let ratio = voice.operators[0].get_frequency_ratio();
                    web_sys::console::log_1(
                        &format!("Group C frequency ratio: {}", ratio).into()
                    );
                }
            },
            "A" => {
                if let Some(voice) = self.voices.get(0) {
                    let ratio = voice.operators[2].get_frequency_ratio();
                    web_sys::console::log_1(
                        &format!("Group A frequency ratio: {}", ratio).into()
                    );
                }
            },
            "B" => {
                if let Some(voice) = self.voices.get(0) {
                    // For group B, log one of the operators (they should be identical)
                    let ratio1 = voice.operators[1].get_frequency_ratio();
                    let ratio3 = voice.operators[3].get_frequency_ratio();
                    web_sys::console::log_1(
                        &format!("Group B frequency ratios: {} and {}", ratio1, ratio3).into()
                    );
                }
            },
            _ => {
                web_sys::console::log_1(&"Invalid operator group!".into());
            },
        }
    }

    /// Log the current algorithm being used.
    #[wasm_bindgen]
    pub fn log_current_algorithm(&self) {
        if let Some(voice) = self.voices.get(0) {
            let config = format!("{:?}", voice.algorithm);
            web_sys::console::log_1(&format!("Current algorithm configuration: {}", config).into());
        } else {
            web_sys::console::log_1(&"No voices available.".into());
        }
    }
}

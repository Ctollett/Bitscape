use crate::oscillator::{Oscillator, WaveType};
use crate::envelope::Envelope;
use wasm_bindgen::prelude::*; // Ensure this is imported for wasm_bindgen support
use web_sys::console;
pub struct FMOperator {
    pub osc: Oscillator,
    mod_index: f32,
    feedback: f32,
    pub envelope: Envelope,
    frequency_ratio: f32,
    harmonics: f32,
    detune: f32,
}

impl FMOperator {
    // Constructor
    pub fn new(frequency: f32, sample_rate: f32, wave_type: WaveType, mod_index: f32, feedback: f32, envelope: Envelope) -> Self {
        Self {
            osc: Oscillator::new(frequency, sample_rate, wave_type),
            mod_index,
            feedback,
            envelope,
            frequency_ratio: 1.0,
            harmonics: 0.0,
            detune: 0.0,
        }
    }


    pub fn generate_sample(&mut self, mod_input: f32, delta_time: f32) -> f32 {
        let env_level = self.envelope.process(delta_time);
        let detuned_freq = self.osc.base_frequency * self.frequency_ratio * (1.0 + self.detune);
        let feedback_effect = self.osc.next_sample() * self.feedback;
        let effective_frequency = detuned_freq + (mod_input + feedback_effect) * self.mod_index;
    
        self.osc.set_frequency(effective_frequency);
        let sample = self.osc.next_sample() * env_level;
        
        // Reset frequency to avoid drift
        self.osc.set_frequency(detuned_freq);  
    
        sample
    }
    
    

    // Getters

    /// Get the modulation index
    pub fn get_mod_index(&self) -> f32 {
        self.mod_index
    }

    /// Get the feedback level
    pub fn get_feedback(&self) -> f32 {
        self.feedback
    }

    /// Get the frequency ratio
    pub fn get_frequency_ratio(&self) -> f32 {
        self.frequency_ratio
    }

    /// Get the harmonics
    pub fn get_harmonics(&self) -> f32 {
        self.harmonics
    }

    /// Get the detune amount
    pub fn get_detune(&self) -> f32 {
        self.detune
    }

    /// Get a reference to the envelope
    pub fn get_envelope(&self) -> &Envelope {
        &self.envelope
    }

    /// Get a reference to the oscillator
    pub fn get_oscillator(&self) -> &Oscillator {
        &self.osc
    }

    // Setters

    /// Set the modulation index
    pub fn set_mod_index(&mut self, depth: f32) {
        self.mod_index = depth;
    }

    /// Set the feedback level
    pub fn set_feedback(&mut self, feedback: f32) {
        self.feedback = feedback;
    }

    /// Set the frequency ratio
    pub fn set_frequency_ratio(&mut self, frequency_ratio: f32) {
        self.frequency_ratio = frequency_ratio;
        console::log_1(&format!("Operator frequency ratio set to: {}", frequency_ratio).into());
    }

    /// Set the harmonics
    pub fn set_harmonics(&mut self, harmonics: f32) {
        self.harmonics = harmonics;
    }

    /// Set the detune amount
    pub fn set_detune(&mut self, detune: f32) {
        self.detune = detune;
    }

    /// Set a new envelope
    pub fn set_envelope(&mut self, envelope: Envelope) {
        self.envelope = envelope;
    }

    /// Set a new oscillator wave type
    pub fn set_wave_type(&mut self, wave_type: WaveType) {
        self.osc.wave_type = wave_type;
    }
}

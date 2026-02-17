use crate::oscillator::{Oscillator, WaveType};
use crate::envelope_trait::EnvelopeTrait;
use std::f32::consts::PI;

pub struct FMOperator {
    pub osc: Oscillator,
    pub envelope: Box<dyn EnvelopeTrait>, // Use a trait object instead of a concrete type
    pub frequency_ratio: f32,
    harm: f32,
    pub feedback_amount: f32,  // Store feedback level
    pub last_output: f32,
    pub is_modulator: bool,
}

impl FMOperator {
    /// Constructor for an operator.
    pub fn new(frequency: f32, sample_rate: f32, wave_type: WaveType, envelope: Box<dyn EnvelopeTrait>, is_modulator: bool) -> Self {
        Self {
            osc: Oscillator::new(frequency, sample_rate, wave_type),
            envelope,
            frequency_ratio: 1.0,
            harm: 0.0,
            feedback_amount: 0.0,  
            last_output: 0.0,
            is_modulator: is_modulator,
        }
    }

    #[inline]
    fn harm_gain(raw: f32) -> f32 {
        const MAX_GAIN: f32 = 12.0;   // keep Digitone-ish headroom
        const GAMMA:    f32 = 0.6;    // <1.0 = softer, try 0.5-0.7
    
        // −26…+26  →  −π…+π radians
        let rad = raw * core::f32::consts::PI / 26.0;
    
        // range 0…1 with softer bend
        let drive = rad.sin().abs().powf(GAMMA);
    
        1.0 + drive * MAX_GAIN
    }

    /// Classic tri-fold wave-folder (one pass, very cheap).
    #[inline]
    fn fold(x: f32, gain: f32) -> f32 {
        let y = x * gain;                       // push the wave up
        let wrapped = y - (2.0*PI) * (y / (2.0*PI)).floor() - PI; // wrap ±π
        wrapped / PI                            // back to –1…+1
    }

    #[inline]
fn pm_offset(sample: f32, index_hz: f32, dt: f32) -> f32 {
    sample * index_hz * dt   // returns offset in *cycles*
}



/// Generate one audio sample for this operator
/// Generate one audio sample using true Phase Modulation.
/// `pm_input` is the phase offset in cycles (already scaled by mod index).
#[inline]
pub fn generate_sample_pm(
    &mut self,
    pm_input  : f32,   // phase offset in cycles (pre-scaled)
    delta_time: f32,   // 1 / sample-rate
) -> f32 {
    /* 1. envelope ------------------------------------------------------- */
    let env_level = self.envelope.process(delta_time);

    /* 2. base pitch ----------------------------------------------------- */
    let base_freq = self.osc.base_frequency * self.frequency_ratio;
    let phase_inc = base_freq * delta_time;  // cycles this sample

    /* 3. true PM: add phase offset directly (no * dt) ------------------- */
    self.osc.update_phase(phase_inc + pm_input);

    /* 4. raw oscillator sample ------------------------------------------ */
    let mut sample = self.osc.compute_sample();

    /* 5. HARM wave-folder (Digitone style) ------------------------------ */
    if self.harm != 0.0 {
        sample = Self::fold(sample, Self::harm_gain(self.harm));
    }

    /* 6. store last output & apply envelope ----------------------------- */
    self.last_output = sample;
    sample * env_level
}

/// Legacy FM-style generate (kept for compatibility, prefer generate_sample_pm)
#[inline]
pub fn generate_sample(
    &mut self,
    mod_input : f32,
    delta_time: f32,
    mod_index : f32,
) -> f32 {
    let pm_cycles = Self::pm_offset(mod_input, 8.0 * mod_index, delta_time);
    self.generate_sample_pm(pm_cycles, delta_time)
}


    
        
    // Other methods remain similar.
    pub fn set_frequency_ratio(&mut self, frequency_ratio: f32) {
        self.frequency_ratio = frequency_ratio.clamp(0.25, 16.0);
    }

    pub fn set_waveform(&mut self, wave_type: WaveType) {
        self.osc.set_wave(wave_type);
    }

    pub fn set_envelope(&mut self, envelope: Box<dyn EnvelopeTrait>) {
        self.envelope = envelope;
    }

    pub fn set_feedback_amount(&mut self, amount: f32) {
        self.feedback_amount = amount.clamp(0.0, 127.0);
    }

    pub fn set_as_modulator(&mut self) {
        self.is_modulator = true;
    }


    pub fn set_harm(&mut self, harm: f32) {
        // New Digitone-style range −26 … +26
        self.harm = harm.clamp(-26.0, 26.0);
    }
}

// synth_engine/src/polyphony.rs

use crate::oscillator::{Oscillator, WaveType};
use crate::effects::delay::Delay;

/// Represents a single voice in the polyphonic synth.
pub struct Voice {
    pub oscillator: Oscillator,
    pub delay: Delay,
    pub active: bool,
}

impl Voice {
    /// Creates a new voice.
    pub fn new(sample_rate: f32) -> Self {
        Voice {
            // Start with a default frequency (will be updated on note_on)
            oscillator: Oscillator::new(440.0, sample_rate, WaveType::Sine),
            // Create a delay effect (adjust parameters as desired)
            delay: Delay::new(sample_rate, 0.1, 0.3, 0.8),
            active: false,
        }
    }

    /// Process one sample for this voice.
    pub fn process_sample(&mut self) -> f32 {
        if self.active {
            let osc_sample = self.oscillator.next_sample();
            self.delay.process_sample(osc_sample)
        } else {
            0.0
        }
    }

    /// Reset the voice (clear state) when reassigning a note.
    pub fn reset(&mut self) {
        self.active = false;
        self.oscillator.phase = 0.0;
        // Optionally, clear the delay buffer if needed.
    }
}

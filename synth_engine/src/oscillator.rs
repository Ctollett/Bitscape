use std::f32::consts::TAU;


#[derive(Debug, Copy, Clone)] // Add Debug here
pub enum WaveType {
    Sine,
    Square,
    Saw,
    Triangle,
    Noise,
    // add more if needed…
}

/// A phase‐accumulating oscillator whose phase is in cycles [0.0, 1.0).
pub struct Oscillator {
    /// Base frequency in Hz (before FM/modulation)
    pub base_frequency: f32,

    /// Current phase in cycles (0 → 1 wraps back to 0)
    pub phase: f32,

    /// Sample rate in Hz
    sample_rate: f32,

    /// Waveform shape
    pub wave: WaveType,
}

impl Oscillator {
    /// Create a new oscillator at `frequency` Hz and sample rate `sr`, using `wave` shape.
    pub fn new(frequency: f32, sr: f32, wave: WaveType) -> Self {
        Self {
            base_frequency: frequency,
            phase: 0.0,
            sample_rate: sr,
            wave,
        }
    }

    /// Set the base frequency (used by FMOperator before applying ratios & modulation).
    pub fn set_frequency(&mut self, freq: f32) {
        self.base_frequency = freq;
    }

    /// Advance the phase by `phase_inc` cycles (where 1.0 = one full cycle).
    pub fn update_phase(&mut self, phase_inc: f32) {
        self.phase = ((self.phase + phase_inc) % 1.0 + 1.0) % 1.0;
    }

    fn fast_rand() -> f32 {
        // parameters from Numerical Recipes
        const A: u32 = 1664525;
        const C: u32 = 1013904223;
    
        thread_local! {
            static SEED: std::cell::RefCell<u32> = std::cell::RefCell::new(0x1234_5678);
        }
    
        SEED.with(|s| {
            let mut seed = *s.borrow();
            seed = seed.wrapping_mul(A).wrapping_add(C);
            *s.borrow_mut() = seed;
            // map 0…u32::MAX → -1.0…+1.0
            (seed as f32 / std::u32::MAX as f32) * 2.0 - 1.0
        })
    }

    /// Compute the current sample based on phase and waveform.
    pub fn compute_sample(&self) -> f32 {
        let angle = self.phase * TAU;

        match self.wave {
            WaveType::Sine =>              angle.sin(),

            WaveType::Square =>            if self.phase < 0.5 {  1.0 } else { -1.0 },

            WaveType::Saw =>               2.0 * (self.phase - 0.5),

            WaveType::Triangle =>          1.0 - 4.0 * (self.phase - 0.5).abs(),

            WaveType::Noise     => Self::fast_rand(),  
        }
    }

    /// Convenience: generate one sample by advancing phase at `frequency` * delta_time.
    /// Not used by FMOperator, but can be handy elsewhere.
    pub fn next_sample(&mut self) -> f32 {
        // delta_time = 1 / sample_rate
        let phase_inc = self.base_frequency / self.sample_rate;
        self.update_phase(phase_inc);
        self.compute_sample()
    }

    pub fn set_wave(&mut self, wave: WaveType) {
        self.wave = wave;
    }
}

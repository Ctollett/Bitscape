#[derive(Clone, Copy, Debug)]
pub enum WaveType {
    Sine,
}

pub struct Oscillator {
    pub frequency: f32,      // Current frequency
    pub base_frequency: f32, // Base (initial) frequency
    pub sample_rate: f32,
    pub phase: f32,
    pub wave_type: WaveType,
}

impl Oscillator {
    pub fn new(frequency: f32, sample_rate: f32, wave_type: WaveType) -> Self {
        Self {
            frequency,
            base_frequency: frequency, // Initialize base_frequency to the starting frequency
            sample_rate,
            phase: 0.0,
            wave_type,
        }
    }

    pub fn next_sample(&mut self) -> f32 {
        let sample = match self.wave_type {
            WaveType::Sine => (2.0 * std::f32::consts::PI * self.phase).sin(),
        };
        let phase_increment = self.frequency / self.sample_rate;
        self.phase = (self.phase + phase_increment) % 1.0;
        sample
    }

    pub fn set_frequency(&mut self, frequency: f32) {
        self.frequency = frequency;
    }
}

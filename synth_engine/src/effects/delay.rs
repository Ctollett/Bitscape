use std::collections::VecDeque;

/// Simple stereo delay effect with feedback and modulation
pub struct Delay {
    sample_rate: f32,
    buffer_l: VecDeque<f32>,
    buffer_r: VecDeque<f32>,
    write_pos: usize,
    max_delay_samples: usize,
    delay_time_ms: f32,
    feedback: f32,
    mix: f32,
}

impl Delay {
    pub fn new(sample_rate: f32) -> Self {
        let max_delay_time = 2000.0; // 2 seconds max
        let max_delay_samples = (sample_rate * max_delay_time / 1000.0) as usize;
        Self {
            sample_rate,
            buffer_l: VecDeque::from(vec![0.0; max_delay_samples]),
            buffer_r: VecDeque::from(vec![0.0; max_delay_samples]),
            write_pos: 0,
            max_delay_samples,
            delay_time_ms: 500.0,
            feedback: 0.5,
            mix: 0.5,
        }
    }

    pub fn set_delay_ms(&mut self, ms: f32) {
        self.delay_time_ms = ms.clamp(0.0, self.max_delay_samples as f32 * 1000.0 / self.sample_rate);
    }

    pub fn set_feedback(&mut self, fb: f32) {
        self.feedback = fb.clamp(0.0, 0.99);
    }

    pub fn set_mix(&mut self, mix: f32) {
        self.mix = mix.clamp(0.0, 1.0);
    }

    pub fn get_delay_ms(&self) -> f32 {
        self.delay_time_ms
    }

    /// Return the current feedback amount (0.0–0.99)
    pub fn get_feedback(&self) -> f32 {
        self.feedback
    }

    /// Return the current wet/dry mix (0.0–1.0)
    pub fn get_mix(&self) -> f32 {
        self.mix
    }

    pub fn process(&mut self, input_l: f32, input_r: f32, _dt: f32) -> (f32, f32) {
        // calculate read position
        let delay_samples = (self.delay_time_ms * self.sample_rate / 1000.0) as usize;
        let read_pos = (self.write_pos + self.max_delay_samples - delay_samples) % self.max_delay_samples;

        let delayed_l = self.buffer_l[read_pos];
        let delayed_r = self.buffer_r[read_pos];

        // Mix dry/wet output
        let out_l = input_l * (1.0 - self.mix) + delayed_l * self.mix;
        let out_r = input_r * (1.0 - self.mix) + delayed_r * self.mix;

        // Write input + attenuated feedback into buffer (prevents amplitude growth)
        self.buffer_l[self.write_pos] = (input_l + delayed_l * self.feedback).clamp(-4.0, 4.0);
        self.buffer_r[self.write_pos] = (input_r + delayed_r * self.feedback).clamp(-4.0, 4.0);

        // increment write head
        self.write_pos = (self.write_pos + 1) % self.max_delay_samples;

        (out_l, out_r)
    }
}
use std::collections::VecDeque;

/// Simple stereo delay effect with feedback and modulation
pub struct Delay {
    sample_rate: f32,
    buffer_l: VecDeque<f32>,
    buffer_r: VecDeque<f32>,
    write_pos: usize,
    max_delay_samples: usize,
    delay_time_ms: f32,        // target delay time set by user
    current_delay_ms: f32,     // smoothed delay time used for reading
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
            current_delay_ms: 500.0,
            feedback: 0.5,
            mix: 0.0,
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
        // Rate-limit delay time changes to at most 0.5 samples worth per audio sample.
        // Exponential smoothing causes burst pitch artifacts for large jumps (e.g. 10→1000ms).
        // A hard rate cap ensures the read head never moves faster than ~1.5x, giving a
        // smooth pitch glide (like tape being sped/slowed) with no discontinuities.
        let max_per_step = 0.5 * 1000.0 / self.sample_rate;
        let diff = self.delay_time_ms - self.current_delay_ms;
        self.current_delay_ms += diff.clamp(-max_per_step, max_per_step);

        // Fractional delay: interpolate between two adjacent samples to eliminate
        // the 1-sample integer jump that causes clicks even with time smoothing
        let delay_f = (self.current_delay_ms * self.sample_rate / 1000.0).max(1.0);
        let delay_int = delay_f.floor() as usize;
        let frac = delay_f - delay_int as f32;

        let pos0 = (self.write_pos + self.max_delay_samples - delay_int) % self.max_delay_samples;
        let pos1 = (self.write_pos + self.max_delay_samples - delay_int - 1) % self.max_delay_samples;

        // Standard stereo delay: read delayed sample for each channel
        let delayed_l = self.buffer_l[pos0] * (1.0 - frac) + self.buffer_l[pos1] * frac;
        let delayed_r = self.buffer_r[pos0] * (1.0 - frac) + self.buffer_r[pos1] * frac;

        // Each channel feeds back into itself
        self.buffer_l[self.write_pos] = (input_l + delayed_l * self.feedback).clamp(-4.0, 4.0);
        self.buffer_r[self.write_pos] = (input_r + delayed_r * self.feedback).clamp(-4.0, 4.0);

        // Dry stays at full level, wet echoes add on top
        let out_l = input_l + delayed_l * self.mix;
        let out_r = input_r + delayed_r * self.mix;

        self.write_pos = (self.write_pos + 1) % self.max_delay_samples;

        (out_l, out_r)
    }
}
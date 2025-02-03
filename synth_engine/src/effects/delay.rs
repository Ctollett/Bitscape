/// A basic delay effect using a circular buffer with a wet/dry mix.
pub struct Delay {
    /// The circular buffer holding previous samples.
    buffer: Vec<f32>,
    /// The size of the buffer.
    buffer_size: usize,
    /// The current write index in the buffer.
    write_index: usize,
    /// The number of samples to delay.
    delay_samples: usize,
    /// The feedback coefficient (range: 0.0 to 1.0).
    feedback: f32,
    /// The wet/dry mix (0.0 = completely dry, 1.0 = completely wet).
    mix: f32,
}

impl Delay {
    /// Creates a new Delay effect.
    ///
    /// * `sample_rate` - The sample rate (e.g., 44100.0).
    /// * `delay_time_seconds` - The desired delay time in seconds.
    /// * `feedback` - The feedback coefficient (typically between 0.0 and 1.0).
    /// * `mix` - The wet/dry mix (0.0 = dry, 1.0 = wet).
    pub fn new(sample_rate: f32, delay_time_seconds: f32, feedback: f32, mix: f32) -> Self {
        let delay_samples = (sample_rate * delay_time_seconds) as usize;
        // Buffer size is delay_samples + 1 to ensure we have enough room.
        let buffer_size = delay_samples + 1;
        Delay {
            buffer: vec![0.0; buffer_size],
            buffer_size,
            write_index: 0,
            delay_samples,
            feedback,
            mix,
        }
    }

    /// Processes one sample through the delay effect.
    ///
    /// The output is a mix of the dry input and the delayed signal.
    /// Returns the output sample after applying the delay.
    pub fn process_sample(&mut self, input: f32) -> f32 {
        // Calculate the read index based on the delay.
        let read_index = if self.write_index >= self.delay_samples {
            self.write_index - self.delay_samples
        } else {
            self.buffer_size + self.write_index - self.delay_samples
        };

        // Retrieve the delayed sample.
        let delayed_sample = self.buffer[read_index];

        // Compute the wet (delayed) portion:
        let wet_signal = input + self.feedback * delayed_sample;
        // Mix the dry and wet signals based on the mix parameter.
        let output = (1.0 - self.mix) * input + self.mix * wet_signal;

        // Write the wet signal into the buffer for feedback.
        self.buffer[self.write_index] = wet_signal;
        // Increment and wrap the write index.
        self.write_index = (self.write_index + 1) % self.buffer_size;

        output
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_delay_basic() {
        let sample_rate = 44100.0;
        // Create a delay with 0.2 seconds delay time, 70% feedback, and 80% wet mix for a dramatic effect.
        let mut delay = Delay::new(sample_rate, 0.2, 0.7, 0.8);

        // Process an impulse (1.0 followed by zeros).
        let impulse = 1.0;
        let output_impulse = delay.process_sample(impulse);
        // The immediate output should be a mix of dry and wet. Since the buffer is initially zero,
        // wet_signal == input, so output = (1 - mix)*input + mix*input == input.
        assert!((output_impulse - 1.0).abs() < 0.0001);

        // Process zeros until we expect the delayed impulse to appear.
        let mut delayed_output = 0.0;
        for _ in 0..(delay.delay_samples - 1) {
            delayed_output = delay.process_sample(0.0);
        }
        // At the delay time, the delayed impulse should appear scaled by feedback and mix.
        delayed_output = delay.process_sample(0.0);
        let expected = 0.8 * (1.0 * 0.7); // mix * (impulse * feedback)
        assert!((delayed_output - expected).abs() < 0.0001);
    }
}


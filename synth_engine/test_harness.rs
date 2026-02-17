// src/test_harness.rs

/// Anything that processes a block of audio can be tested.
pub trait AudioTest {
    /// Process one block of input samples, returning output.
    fn name(&self) -> &'static str;
    fn process_block(&mut self, input: &[f32], dt: f32) -> Vec<f32>;
}

/// A diagnostic you can run on any pair of input/output.
pub trait Diagnostic {
    fn name(&self) -> &'static str;
    fn run(&self, input: &[f32], output: &[f32]) -> String;
}

/// A simple harness that takes any AudioTest and runs all Diagnostics on it.
pub struct TestHarness {
    diagnostics: Vec<Box<dyn Diagnostic>>,
}

impl TestHarness {
    pub fn new(diagnostics: Vec<Box<dyn Diagnostic>>) -> Self {
        Self { diagnostics }
    }
    pub fn run<T: AudioTest>(&self, mut test: T) {
        let sample_rate = 48_000.0;
        let dt = 1.0 / sample_rate;
        // generate a 440 Hz sine sweep or steady tone
        let input: Vec<f32> = (0..sample_rate as usize)
            .map(|i| (2.0 * std::f32::consts::PI * 440.0 * (i as f32) / sample_rate).sin())
            .collect();
        let output = test.process_block(&input, dt);

        println!("=== Test: {} ===", test.name());
        for diag in &self.diagnostics {
            println!("  {} → {}", diag.name(), diag.run(&input, &output));
        }
        println!();
    }
}

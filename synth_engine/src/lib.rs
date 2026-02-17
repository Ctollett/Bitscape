//! Crate root for the Rust FM Synth
//!
//! This library exposes a WebAssembly-friendly `Synth` type for polyphonic FM synthesis,
//! along with supporting modules for oscillators, envelopes, operators, filtering, etc.

// Re-export modules
pub mod oscillator;
pub mod envelope;
pub mod envelope_trait;
pub mod mod_envelope;
pub mod operator;
pub mod algorithm;
pub mod noop_envelope;
pub mod voice;
pub mod filter;
pub mod synth;
pub mod effects;
pub mod lfo;

// Make the `Synth` type available at the crate root
pub use synth::Synth;

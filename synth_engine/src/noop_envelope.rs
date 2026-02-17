use crate::envelope_trait::EnvelopeTrait;

/// A no-op envelope that always returns 1.0 and does nothing.
#[derive(Clone)]
pub struct NoopEnvelope;

impl EnvelopeTrait for NoopEnvelope {
    fn note_on(&mut self) {}
    fn note_off(&mut self) {}
    fn process(&mut self, _delta_time: f32) -> f32 {
        1.0
    }
    fn get_level(&self) -> f32 {
        1.0
    }
}

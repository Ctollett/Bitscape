// src/envelope_trait.rs
pub trait EnvelopeTrait: Send {
    fn note_on(&mut self);
    fn note_off(&mut self);
    fn process(&mut self, delta_time: f32) -> f32;
    fn get_level(&self) -> f32;
}

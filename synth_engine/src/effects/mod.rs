// src/effects/mod.rs

pub mod delay;
pub mod chorus;
pub mod reverb;

use delay::Delay;
use reverb::Reverb;
use chorus::Chorus;

pub struct Effects {
    pub delay: Delay,
    pub reverb: Reverb,
    pub chorus: Chorus,
}

impl Effects {
    pub fn new(sample_rate: f32) -> Self {
        Self {
            delay: Delay::new(sample_rate),
            reverb: Reverb::new(sample_rate),
            chorus: Chorus::new(sample_rate),
        }
    }

    pub fn process(&mut self, l: f32, r: f32, dt: f32) -> (f32, f32) {
        // 1. Chorus first (time-modulation before time-based effects)
        let (l, r) = self.chorus.process(l, r, dt);
        // 2. Delay
        let (l, r) = self.delay.process(l, r, dt);
        // 3. Reverb last (longest tail, should be at end of chain)
        self.reverb.process(l, r, dt)
    }
}

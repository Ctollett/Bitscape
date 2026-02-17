use crate::envelope_trait::EnvelopeTrait;

#[derive(Clone, Debug, PartialEq)]
pub enum EnvelopeState {
    Idle,
    Attack,
    Decay,
    Sustain,
    Release,
}

#[derive(Clone, Debug)]
pub struct Envelope {
    /// Attack time in seconds (0 ⇒ instantaneous)
    pub attack:  f32,
    /// Decay time in seconds
    pub decay:   f32,
    /// Sustain level (0.0–1.0)
    pub sustain: f32,
    /// Release time in seconds
    pub release: f32,
    level:      f32,           // current output level
    state:      EnvelopeState, // current ADSR phase
}

impl Envelope {
    /// The maximum time (in seconds) that a non-infinite knob (1..=126) can map to.
    pub const MAX_TIME: f32 = 10.0;

    /// Build an Envelope from Digitone-style 0–127 knobs:
    /// - 0 ⇒ 0.0s (instant)
    /// - 1–126 ⇒ linear 0..MAX_TIME
    /// - 127 ⇒ ∞ (hold forever)
    /// Map a Digitone-style 0–127 knob to seconds.
    pub fn map_time(v: u8) -> f32 {
        match v {
            0           => 0.0,
            127         => f32::INFINITY,
            1..=126     => (v as f32 / 126.0) * Envelope::MAX_TIME,
            _           => unreachable!(),
        }
    }

    /// Build an Envelope from Digitone-style 0–127 knobs:
    /// - 0 => 0.0s (instant)
    /// - 1–126 => linear 0..MAX_TIME
    /// - 127 => hold forever
    pub fn from_digitone(atk: u8, dec: u8, sus: u8, rel: u8) -> Self {
        Envelope {
            attack:  Self::map_time(atk),
            decay:   Self::map_time(dec),
            sustain: sus as f32 / 127.0,
            release: Self::map_time(rel),
            level:   0.0,
            state:   EnvelopeState::Idle,
        }
    }

    /// Start the envelope. If attack is zero, jump immediately to peak.
    pub fn note_on(&mut self) {
        if self.attack == 0.0 {
            // zero-length attack → instant click
            self.level = 1.0;
            self.state = EnvelopeState::Decay;
        } else {
            // normal attack ramp
            self.level = 0.0;
            self.state = EnvelopeState::Attack;
        }
    }
    /// Begin release phase
    pub fn note_off(&mut self) {
        self.state = EnvelopeState::Release;
    }

    /// Advance the envelope by `dt` seconds, returning the new output level.
    pub fn process(&mut self, dt: f32) -> f32 {
        match self.state {
            EnvelopeState::Idle => {
                self.level = 0.0;
            }

            EnvelopeState::Attack => {
                // attack > 0 here
                let atk = self.attack.max(1e-6);
                self.level += dt / atk;
                if self.level >= 1.0 {
                    self.level = 1.0;
                    self.state = EnvelopeState::Decay;
                }
            }

            EnvelopeState::Decay => {
                let dec = self.decay.max(1e-6);
                let next = self.level - dt / dec;
                if next <= self.sustain {
                    self.level = self.sustain;
                    self.state = EnvelopeState::Sustain;
                } else {
                    self.level = next;
                }
            }

            EnvelopeState::Sustain => {
                // hold sustain level
            }

            EnvelopeState::Release => {
                let rel = self.release.max(1e-6);
                self.level -= dt / rel;
                if self.level <= 0.0 {
                    self.level = 0.0;
                    self.state = EnvelopeState::Idle;
                }
            }
        }

        self.level
    }

    /// Returns true when the envelope has finished releasing and is silent.
    pub fn is_idle(&self) -> bool {
        self.state == EnvelopeState::Idle
    }
}

impl EnvelopeTrait for Envelope {
    fn note_on(&mut self)           { self.note_on() }
    fn note_off(&mut self)          { self.note_off() }
    fn process(&mut self, dt: f32) -> f32 { self.process(dt) }
    fn get_level(&self)     -> f32 { self.level }
}


#[cfg(test)]
mod tests {
    use super::*;

    const SR: f32 = 48_000.0;
    const DT: f32 = 1.0 / SR;

    /// Step until env crosses target, return seconds elapsed.
    fn time_to_cross(env: &mut Envelope, target: f32, max_time: f32) -> f32 {
        let mut t = 0.0;
        let start = env.level;
        if start < target {
            while t < max_time && env.process(DT) < target {
                t += DT;
            }
        } else {
            while t < max_time && env.process(DT) > target {
                t += DT;
            }
        }
        t
    }

    #[test]
    fn digitone_attack_mapping() {
        for &knob in &[0u8, 63, 126, 127] {
            let env = Envelope::from_digitone(knob, 0, 0, 0);
            let expected = if knob >= 127 {
                f32::INFINITY
            } else {
                (knob as f32/126.0)*Envelope::MAX_TIME
            };
            assert_eq!(env.attack, expected, "atk knob {} maps to {}s", knob, expected);
        }
    }

    #[test]
    fn digitone_decay_mapping() {
        for &knob in &[0u8, 64, 126] {
            let env = Envelope::from_digitone(0, knob, 0, 0);
            let expected=(knob as f32/126.0)*Envelope::MAX_TIME;
            assert!((env.decay-expected).abs()<1e-6,
                "dec knob {} maps to {}s", knob, expected);
        }
    }

    #[test]
    fn attack_time_measured_matches_from_digitone() {
        let knob = 63u8;
        let mut env = Envelope::from_digitone(knob,0,0,0);
        let expected = env.attack;
        env.note_on();
        let measured = time_to_cross(&mut env,1.0, expected*2.0);
        assert!((measured-expected).abs() < expected*0.05,
            "measured {:.3}s vs expected {:.3}s for knob {}", measured, expected, knob);
    }

    #[test]
    fn decay_time_measured_matches_from_digitone() {
        let knob = 63u8;
        let mut env = Envelope::from_digitone(0, knob, 0, 0);
    
        // prepare envelope in the decay state
        env.level = 1.0;
        env.state = EnvelopeState::Decay;
    
        // snapshot the sustain level so we don’t borrow `env` twice
        let sustain_level = env.sustain;
    
        // expected time = (1.0 – sustain) * decay_time
        let expected = (1.0 - sustain_level) * env.decay;
    
        // now call time_to_cross using that local
        let measured = time_to_cross(&mut env, sustain_level, expected * 2.0);
    
        assert!((measured - expected).abs() < expected * 0.05,
            "measured {:.3}s vs expected {:.3}s for knob {}", measured, expected, knob);
    }
    

    #[test]
    fn release_time_measured_matches_from_digitone() {
        let knob = 63u8;
        let mut env = Envelope::from_digitone(0,0,knob,knob);
        let start = env.sustain;
        env.level=start; env.state=EnvelopeState::Release;
        let expected=start*env.release;
        let measured=time_to_cross(&mut env,0.0,expected*2.0);
        assert!((measured-expected).abs()<expected*0.05,
            "measured {:.3}s vs expected {:.3}s for knob {}", measured, expected, knob);
    }
}

// mod_envelope.rs

use crate::envelope_trait::EnvelopeTrait;

#[derive(Clone)]
pub enum ModEnvelopeState {
    Idle,
    Attack,
    Decay,
    Sustain, // Holds the "end" level.
}

#[derive(Clone)]
pub struct ModEnvelope {
    pub attack: f32,  // Attack time in seconds
    pub decay: f32,   // Decay time in seconds
    pub end: f32,     // End level (normalized amplitude, 0.0 to 1.0)
    pub level: f32,   // Current level (0.0 to 1.0)
    pub state: ModEnvelopeState,
}

impl ModEnvelope {
    /// Maximum envelope time in seconds (matches carrier Envelope::MAX_TIME)
    const MAX_TIME: f32 = 10.0;

    /// Map a 0-127 knob value to time in seconds:
    /// 0 → instant, 1-126 → linear 0..MAX_TIME, 127 → hold forever
    fn map_time(v: u32) -> f32 {
        match v {
            0       => 0.0,
            127     => f32::INFINITY,
            1..=126 => (v as f32 / 126.0) * Self::MAX_TIME,
            _       => (v.min(127) as f32 / 126.0) * Self::MAX_TIME,
        }
    }

    /// Create a new modulator envelope from parameters in the range 0-127.
    pub fn new_from_values(attack_val: u32, decay_val: u32, end_val: u32) -> Self {
        ModEnvelope {
            attack: Self::map_time(attack_val),
            decay: Self::map_time(decay_val),
            end: end_val as f32 / 127.0,
            level: 0.0,
            state: ModEnvelopeState::Idle,
        }
    }

    /// Trigger the envelope (start the attack phase).
    pub fn note_on(&mut self) {
        self.state = ModEnvelopeState::Attack;
    }

    /// Trigger note off. For modulator envelopes, we simply reset the state.
    pub fn note_off(&mut self) {
        self.state = ModEnvelopeState::Idle;
        self.level = 0.0;
    }

    /// Process the envelope over a time step (delta_time in seconds) and update the level.
    pub fn process(&mut self, delta_time: f32) -> f32 {
        match self.state {
            ModEnvelopeState::Idle => {
                self.level = 0.0;
            }
            ModEnvelopeState::Attack => {
                if self.attack > 0.0 && self.attack.is_finite() {
                    self.level += delta_time / self.attack;
                } else if self.attack == 0.0 {
                    self.level = 1.0;
                }
                // attack == INFINITY: level stays where it is (hold)
                if self.level >= 1.0 {
                    self.level = 1.0;
                    self.state = ModEnvelopeState::Decay;
                }
            }
            ModEnvelopeState::Decay => {
                if self.decay > 0.0 && self.decay.is_finite() {
                    self.level -= delta_time / self.decay;
                } else if self.decay == 0.0 {
                    self.level = self.end;
                }
                if self.level <= self.end {
                    self.level = self.end;
                    self.state = ModEnvelopeState::Sustain;
                }
            }
            ModEnvelopeState::Sustain => {
                // Hold the level at the "end" value.
            }
        }
        self.level
    }
}

impl EnvelopeTrait for ModEnvelope {
    fn note_on(&mut self) { self.note_on(); }
    fn note_off(&mut self) { self.note_off(); }
    fn process(&mut self, delta_time: f32) -> f32 { self.process(delta_time) }
    fn get_level(&self) -> f32 { self.level }
}

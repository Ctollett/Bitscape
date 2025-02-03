// src/envelope.rs
#[derive(Clone)]
pub enum EnvelopeState {
    Idle,
    Attack,
    Decay,
    Sustain,
    Release,
}

#[derive(Clone)]
pub struct Envelope {
    pub attack: f32,   // in seconds
    pub decay: f32,    // in seconds
    pub sustain: f32,  // sustain level (0.0 - 1.0)
    pub release: f32,  // in seconds
    pub level: f32,    // current amplitude level (0.0 - 1.0)
    pub state: EnvelopeState,
}

impl Envelope {
    pub fn new(attack: f32, decay: f32, sustain: f32, release: f32) -> Self {
        Envelope {
            attack,
            decay,
            sustain,
            release,
            level: 0.0,
            state: EnvelopeState::Idle,
        }
    }

    /// Call when a note is triggered.
    pub fn note_on(&mut self) {
        self.state = EnvelopeState::Attack;
    }

    /// Call when a note is released.
    pub fn note_off(&mut self) {
        self.state = EnvelopeState::Release;
    }

    /// Process the envelope for a given time step (delta_time in seconds) and update level.
    pub fn process(&mut self, delta_time: f32) -> f32 {
        match self.state {
            EnvelopeState::Idle => {
                // When idle, the level remains at 0.
                self.level = 0.0;
            }
            EnvelopeState::Attack => {
                // Increase level toward 1.0 over the attack time.
                self.level += delta_time / self.attack;
                if self.level >= 1.0 {
                    self.level = 1.0;
                    self.state = EnvelopeState::Decay;
                }
            }
            EnvelopeState::Decay => {
                // Decrease level toward sustain over the decay time.
                self.level -= delta_time / self.decay;
                if self.level <= self.sustain {
                    self.level = self.sustain;
                    self.state = EnvelopeState::Sustain;
                }
            }
            EnvelopeState::Sustain => {
                // Sustain maintains a constant level.
            }
            EnvelopeState::Release => {
                // Decrease level to 0 over the release time.
                self.level -= delta_time / self.release;
                if self.level <= 0.0 {
                    self.level = 0.0;
                    self.state = EnvelopeState::Idle;
                }
            }
        }
        self.level
    }
}

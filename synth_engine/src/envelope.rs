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

    /// Call this when a note is triggered.
    pub fn note_on(&mut self) {
        self.state = EnvelopeState::Attack;
    }

    /// Call this when a note is released.
    pub fn note_off(&mut self) {
        self.state = EnvelopeState::Release;
    }

    /// Process the envelope over a time step (delta_time in seconds) and update the level.
    pub fn process(&mut self, delta_time: f32) -> f32 {
        match self.state {
            EnvelopeState::Idle => {
                self.level = 0.0;
            }
            EnvelopeState::Attack => {
                self.level += delta_time / self.attack;
                if self.level >= 1.0 {
                    self.level = 1.0;
                    self.state = EnvelopeState::Decay;
                }
            }
            EnvelopeState::Decay => {
                self.level -= delta_time / self.decay;
                if self.level <= self.sustain {
                    self.level = self.sustain;
                    self.state = EnvelopeState::Sustain;
                }
            }
            EnvelopeState::Sustain => {
                // Maintain sustain level.
            }
            EnvelopeState::Release => {
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

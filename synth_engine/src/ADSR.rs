#[derive(Debug, PartialEq)]
enum EnvelopeState {
    Idle,
    Attack,
    Decay,
    Sustain,
    Release,
}

/// A standard ADSR envelope generator.
pub struct Envelope {
    state: EnvelopeState,
    level: f32,
    pub attack: f32,
    pub decay: f32,
    pub sustain: f32,
    pub release: f32,
}

impl Envelope {
    /// Construct a new ADSR envelope with given times (in seconds).
    pub fn new(attack: f32, decay: f32, sustain: f32, release: f32) -> Self {
        Self {
            state: EnvelopeState::Idle,
            level: 0.0,
            attack,
            decay,
            sustain,
            release,
        }
    }

    /// Trigger the attack phase.
    pub fn note_on(&mut self) {
        self.state = EnvelopeState::Attack;
    }

    /// Trigger the release phase.
    pub fn note_off(&mut self) {
        self.state = EnvelopeState::Release;
    }

    /// Process the envelope for a given time step (delta_time in seconds) and update level.
    pub fn process(&mut self, delta_time: f32) -> f32 {
        match self.state {
            EnvelopeState::Idle => {
                self.level = 0.0;
            }
            EnvelopeState::Attack => {
                let atk = self.attack.max(1e-6);
                self.level += delta_time / atk;
                if self.level >= 1.0 {
                    self.level = 1.0;
                    self.state = EnvelopeState::Decay;
                }
            }
            EnvelopeState::Decay => {
                let dec = self.decay.max(1e-6);
                self.level -= delta_time / dec;
                if self.level <= self.sustain {
                    self.level = self.sustain;
                    self.state = EnvelopeState::Sustain;
                }
            }
            EnvelopeState::Sustain => {
                // Hold level constant
            }
            EnvelopeState::Release => {
                let rel = self.release.max(1e-6);
                self.level -= delta_time / rel;
                if self.level <= 0.0 {
                    self.level = 0.0;
                    self.state = EnvelopeState::Idle;
                }
            }
        }

        self.level
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Step the envelope forward until it crosses `target`, or until `max_time` seconds.
    fn time_to_cross(env: &mut Envelope, target: f32, dt: f32, max_time: f32) -> f32 {
        let mut t = 0.0;
        while t < max_time {
            let lvl = env.process(dt);
            if lvl >= target {
                break;
            }
            t += dt;
        }
        t
    }

    #[test]
    fn attack_phase_reaches_one_in_time() {
        let attack = 0.1;
        let mut env = Envelope::new(attack, 0.2, 0.5, 0.3);
        let dt = 1.0 / 48_000.0;

        // Begin attack
        env.note_on();

        // Measure how long until level >= 0.99
        let measured = time_to_cross(&mut env, 0.99, dt, attack * 2.0);
        let tol = attack * 0.05; // 5% tolerance
        assert!((measured - attack).abs() <= tol,
            "attack took {:.4}s but expected {:.4}s", measured, attack);

        // Ensure we transitioned state to Decay
        assert_eq!(env.state, EnvelopeState::Decay);
    }

    #[test]
    fn decay_phase_reaches_sustain_in_time() {
        let attack = 0.01;
        let decay = 0.2;
        let sustain = 0.6;
        let mut env = Envelope::new(attack, decay, sustain, 0.3);
        let dt = 1.0 / 48_000.0;

        env.note_on();
        let _ = time_to_cross(&mut env, 0.99, dt, attack * 2.0);

        // Measure decay down to sustain + e
        let measured = time_to_cross(&mut env, sustain + 0.01, dt, decay * 2.0);
        let tol = decay * 0.05;
        assert!((measured - decay).abs() <= tol,
            "decay took {:.4}s but expected {:.4}s", measured, decay);

        // Ensure state is now Sustain
        assert_eq!(env.state, EnvelopeState::Sustain);
    }

    #[test]
    fn release_phase_falls_to_zero_in_time() {
        let attack = 0.01;
        let decay = 0.05;
        let sustain = 0.7;
        let release = 0.15;
        let mut env = Envelope::new(attack, decay, sustain, release);
        let dt = 1.0 / 48_000.0;

        env.note_on();
        let _ = time_to_cross(&mut env, 0.99, dt, attack * 2.0);
        let _ = time_to_cross(&mut env, sustain + 0.01, dt, decay * 2.0);

        // Trigger release
        env.note_off();
        let measured = time_to_cross(&mut env, 0.01, dt, release * 2.0);
        let tol = release * 0.05;
        assert!((measured - release).abs() <= tol,
            "release took {:.4}s but expected {:.4}s", measured, release);

        // Ensure we ended in Idle
        assert_eq!(env.state, EnvelopeState::Idle);
    }
}

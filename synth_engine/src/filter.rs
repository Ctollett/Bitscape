/// src/filter.rs — Biquad filter (Direct Form II Transposed)
use crate::envelope::Envelope;
use crate::envelope_trait::EnvelopeTrait;
use std::f32::consts::PI;

#[derive(Copy, Clone)]
pub enum FilterType {
    LowPass,
    HighPass,
}

pub struct Filter {
    ty: FilterType,
    cutoff: f32,
    resonance: f32,
    env_amount: f32,
    envelope: Envelope,
    // biquad coefficients (normalized)
    b0: f32, b1: f32, b2: f32,
    a1: f32, a2: f32,
    // Direct Form II Transposed state
    s1: f32, s2: f32,
    sample_rate: f32,
    // Track whether coefficients need recalculation
    coeffs_dirty: bool,
}

impl Filter {
    pub fn new(sample_rate: f32) -> Self {
        let mut f = Filter {
            ty: FilterType::LowPass,
            cutoff: 1000.0,
            resonance: 0.707,
            env_amount: 0.0,
            envelope: Envelope::from_digitone(1, 13, 127, 25),
            b0: 0.0, b1: 0.0, b2: 0.0,
            a1: 0.0, a2: 0.0,
            s1: 0.0, s2: 0.0,
            sample_rate,
            coeffs_dirty: true,
        };
        f.update_coeffs();
        f
    }

    fn update_coeffs(&mut self) {
        let env = self.envelope.get_level();
        let freq = (self.cutoff + env * self.env_amount).clamp(20.0, self.sample_rate * 0.49);
        let w0 = 2.0 * PI * freq / self.sample_rate;
        let cosw = w0.cos();
        let sinw = w0.sin();
        let alpha = sinw / (2.0 * self.resonance.max(0.1));

        let (b0, b1, b2, a0, a1, a2) = match self.ty {
            FilterType::LowPass => {
                let b1 = 1.0 - cosw;
                ((1.0 - cosw) / 2.0, b1, (1.0 - cosw) / 2.0,
                 1.0 + alpha, -2.0 * cosw, 1.0 - alpha)
            }
            FilterType::HighPass => {
                let b1 = -(1.0 + cosw);
                ((1.0 + cosw) / 2.0, b1, (1.0 + cosw) / 2.0,
                 1.0 + alpha, -2.0 * cosw, 1.0 - alpha)
            }
        };

        // Normalize by a0
        let inv_a0 = 1.0 / a0;
        self.b0 = b0 * inv_a0;
        self.b1 = b1 * inv_a0;
        self.b2 = b2 * inv_a0;
        self.a1 = a1 * inv_a0;
        self.a2 = a2 * inv_a0;
        self.coeffs_dirty = false;
    }

    pub fn cutoff(&self) -> f32 { self.cutoff }
    pub fn resonance(&self) -> f32 { self.resonance }
    pub fn env_amount(&self) -> f32 { self.env_amount }

    pub fn attack(&self) -> f32  { self.envelope.attack }
    pub fn decay(&self) -> f32   { self.envelope.decay }
    pub fn sustain(&self) -> f32 { self.envelope.sustain }
    pub fn release(&self) -> f32 { self.envelope.release }

    pub fn set_type(&mut self, t: FilterType) { self.ty = t; self.coeffs_dirty = true; }
    pub fn set_cutoff(&mut self, f: f32)      { self.cutoff = f; self.coeffs_dirty = true; }
    pub fn set_resonance(&mut self, r: f32)   { self.resonance = r; self.coeffs_dirty = true; }
    pub fn set_env_amount(&mut self, e: f32)  { self.env_amount = e; self.coeffs_dirty = true; }

    pub fn set_attack(&mut self, v: f32)  { self.envelope.attack  = v; }
    pub fn set_decay(&mut self, v: f32)   { self.envelope.decay   = v; }
    pub fn set_sustain(&mut self, v: f32) { self.envelope.sustain = v; }
    pub fn set_release(&mut self, v: f32) { self.envelope.release = v; }

    pub fn note_on(&mut self)  { self.envelope.note_on(); self.coeffs_dirty = true; }
    pub fn note_off(&mut self) { self.envelope.note_off(); }

    /// Process one sample — Direct Form II Transposed (stable at high Q)
    pub fn process(&mut self, input: f32, dt: f32) -> f32 {
        // Advance envelope; only recalc coefficients if something changed
        let prev_level = self.envelope.get_level();
        self.envelope.process(dt);
        if self.coeffs_dirty || (self.envelope.get_level() - prev_level).abs() > 1e-6 {
            self.update_coeffs();
        }

        // DF2T: y[n] = b0*x[n] + s1
        //       s1 = b1*x[n] - a1*y[n] + s2
        //       s2 = b2*x[n] - a2*y[n]
        let out = self.b0 * input + self.s1;
        self.s1 = self.b1 * input - self.a1 * out + self.s2;
        self.s2 = self.b2 * input - self.a2 * out;
        out
    }
}

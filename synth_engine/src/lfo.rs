use js_sys::Math;
use std::f32::consts::PI;

/// All possible modulation destinations for an LFO.
#[derive(Copy, Clone, Debug)]
pub enum LfoDestination {
    // FM synth (SYN1 / SYN2) parameters
    ModDepthA,
    ModDepthB,
    RatioC,
    RatioA,
    RatioB,
    Feedback,
    Harm,
    CarrierMix,
    // Amp envelope parameters (AMP page)
    AmpAttack,
    AmpDecay,
    AmpSustain,
    AmpRelease,
    // Amp section parameters
    Overdrive,
    Pan,
    Volume,
    // Filter envelope parameters (FLTR page)
    FilterAttack,
    FilterDecay,
    FilterSustain,
    FilterRelease,
    // Multimode filter parameters
    FilterCutoff,
    FilterResonance,
    FilterEnvAmount,
}

/// Waveform shapes for the LFO.
#[derive(Copy, Clone, Debug)]
pub enum Waveform {
    Triangle,
    Sine,
    Square,
    Sawtooth,
    Exponential,
    Ramp,
    Random,
}

/// Trigger modes for the LFO.
#[derive(Copy, Clone, Debug)]
pub enum LfoMode {
    Free,
    Trigger,
    Hold,
    One,
    Half,
}


pub struct Lfo {
    // Core parameters
    _sample_rate: f32,
    speed: f32,         // -64..63 bipolar speed
    multiplier: i32,    // integer multiplier
    fade: i32,          // -64..63 fade in/out
    pub destination: LfoDestination,
    waveform: Waveform,
    start_phase: f32,   // 0.0..1.0 start phase offset
    mode: LfoMode,
    depth: f32,         // -1.0..1.0 modulation depth

    current:       f32,

    // Internal state
    phase: f32,         // continuous phase (cycles)
    fade_env: f32,      // 0.0..1.0 fade envelope
    triggered: bool,    // note trigger state
    random_val: f32,    // current random value for Random waveform
}

impl Lfo {
    /// Maximum LFO frequency in Hz (above ~30Hz is audio rate, not useful as LFO)
    const MAX_FREQ: f32 = 30.0;

    /// Create a new LFO with defaults
    pub fn new(sample_rate: f32) -> Self {
        Self {
            _sample_rate: sample_rate,
            speed: 0.0,
            multiplier: 1,
            fade: 0,
            destination: LfoDestination::ModDepthA,
            waveform: Waveform::Triangle,
            start_phase: 0.0,
            mode: LfoMode::Free,
            depth: 0.0,
            current: 0.0,

            phase: 0.0,
            fade_env: 1.0,
            triggered: false,
            random_val: 0.0,
        }
    }

    // —— Parameter setters ——
    pub fn set_speed(&mut self, v: f32)    { self.speed = v.clamp(-64.0, 63.0); }
    pub fn set_multiplier(&mut self, m: i32){ self.multiplier = m; }
    pub fn set_fade(&mut self, f: i32)     { self.fade = f; }
    pub fn set_destination(&mut self, d: LfoDestination) { self.destination = d; }
    pub fn set_waveform(&mut self, w: Waveform)          { self.waveform = w; }
    pub fn set_start_phase(&mut self, p: f32) { self.start_phase = p.clamp(0.0, 1.0); }
    pub fn set_mode(&mut self, m: LfoMode)     { self.mode = m; }
    pub fn set_depth(&mut self, d: f32)        { self.depth = d.clamp(-1.0, 1.0); }

    pub fn current(&self) -> f32 {
        self.current
    }

    /// Should be called on note-on to handle Trigger/Hold/One modes.
    pub fn note_on(&mut self) {
        self.triggered = true;
        if matches!(self.mode, LfoMode::Trigger | LfoMode::One | LfoMode::Half) {
            self.phase = self.start_phase;
        }
        self.fade_env = if self.fade < 0 { 0.0 } else { 1.0 };
    }

    /// Should be called on note-off to reset hold, etc.
    pub fn note_off(&mut self) {
        self.triggered = false;
    }

    /// Advance LFO by dt seconds and return current modulation value in [-1..1].
    pub fn process(&mut self, dt: f32) -> f32 {
        // 1) handle fade envelope
        if self.fade != 0 {
            let fade_time = (self.fade.unsigned_abs() as f32 / 63.0) * 5.0; // 0-5 seconds
            let fade_rate = if fade_time > 0.0 { 1.0 / fade_time } else { 1000.0 };
            if self.fade < 0 {
                // fade in
                self.fade_env = (self.fade_env + fade_rate * dt).min(1.0);
            } else {
                // fade out
                self.fade_env = (self.fade_env - fade_rate * dt).max(0.0);
            }
        }

        // 2) advance phase — speed mapped to 0..MAX_FREQ Hz (with multiplier)
        // Symmetric normalization: -64..63 → -1..~1 (use 64 for both directions)
        let speed_norm = (self.speed / 64.0).clamp(-1.0, 1.0);      // -1..1
        let freq = speed_norm.abs() * Self::MAX_FREQ                 // 0..MAX_FREQ
                 * (self.multiplier.max(1) as f32);                  // scaled by multiplier
        let delta = freq * dt * speed_norm.signum();                 // allow backwards
        self.phase += delta;

        // wrap phase
        if self.phase < 0.0 || self.phase >= 1.0 {
            self.phase = (self.phase % 1.0 + 1.0) % 1.0;
            // random waveform picks new value each cycle
            if let Waveform::Random = self.waveform {
                let r = Math::random();
                self.random_val = (r as f32) * 2.0 - 1.0;
            }
            // handle One-shot modes
            if matches!(self.mode, LfoMode::One) { self.depth = 0.0; }
            if matches!(self.mode, LfoMode::Half) && (self.phase - self.start_phase).abs() > 0.5 {
                self.depth = 0.0;
            }
        }

        // 3) generate raw wave value in [-1..1]
        let ph = (self.phase + self.start_phase).fract();
        let raw = match self.waveform {
            Waveform::Triangle    => 2.0 * (2.0 * ph - 1.0).abs() - 1.0,
            Waveform::Sine        => (2.0 * PI * ph).sin(),
            Waveform::Square      => if ph < 0.5 { 1.0 } else { -1.0 },
            Waveform::Sawtooth    => 2.0 * ph - 1.0,
            Waveform::Exponential => {
                // Smooth exponential curve: rises slowly then quickly, range [-1..1]
                // Map phase to exponential rise, normalized to [-1..1]
                let rise = (ph * 4.0).exp();           // e^0=1 .. e^4≈55
                let norm = (rise - 1.0) / (54.598);    // normalize to 0..1
                norm * 2.0 - 1.0                        // map to -1..1
            }
            Waveform::Ramp        => 1.0 - 2.0 * ph,
            Waveform::Random      => self.random_val,
        };

        // 4) apply depth and fade
        let v = raw * self.depth * self.fade_env;
        self.current = v;
        v
    }

    pub fn speed(&self) -> f32           { self.speed }
    pub fn multiplier(&self) -> i32      { self.multiplier }
    pub fn fade(&self) -> i32            { self.fade }
    pub fn destination(&self) -> LfoDestination { self.destination }
    pub fn waveform(&self) -> Waveform   { self.waveform }
    pub fn start_phase(&self) -> f32     { self.start_phase }
    pub fn mode(&self) -> LfoMode        { self.mode }
    pub fn depth(&self) -> f32           { self.depth }
}

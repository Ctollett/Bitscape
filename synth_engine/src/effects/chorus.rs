use crate::filter::{Filter, FilterType};

/// Stereo chorus effect
pub struct Chorus {
    sample_rate: f32,
    /// Dry/wet mix (0.0 = dry, 1.0 = fully wet)
    depth: f32,
    /// LFO speed in Hz
    speed: f32,
    /// High-pass filter for the wet signal
    hpf: Filter,
    /// Stereo width (0.0 = mono, 1.0 = full stereo)
    width: f32,
    /// Base delay time in milliseconds
    delay_ms: f32,
    /// Reverb send amount (0.0–1.0)
    reverb_send: f32,
    /// LFO phase [0..1)
    lfo_phase: f32,
    /// Delay buffer (mono) for simplicity
    buffer: Vec<f32>,
    write_idx: usize,
}

impl Chorus {
    /// Create a Chorus with reasonable defaults
    pub fn new(sample_rate: f32) -> Self {
        // maximum delay: base + depth ~ 100 ms
        let max_delay_samples = (sample_rate * 0.2) as usize;
        Self {
            sample_rate,
            depth: 0.5,
            speed: 1.0,
            hpf: {
                let mut f = Filter::new(sample_rate);
                f.set_type(FilterType::HighPass);
                // default HPF cutoff ~ 200 Hz
                f.set_cutoff(200.0);
                f.set_resonance(0.707);
                f
            },
            width: 0.5,
            delay_ms: 30.0,
            reverb_send: 0.0,
            lfo_phase: 0.0,
            buffer: vec![0.0; max_delay_samples],
            write_idx: 0,
        }
    }

    /// Set the chorus mix depth (0.0–1.0)
    pub fn set_depth(&mut self, d: f32) { self.depth = d.clamp(0.0, 1.0); }
    /// Set the LFO speed in Hz
    pub fn set_speed(&mut self, hz: f32) { self.speed = hz; }
    /// Set the HPF cutoff frequency
    pub fn set_hpf_cutoff(&mut self, hz: f32) { self.hpf.set_cutoff(hz); }
    /// Set stereo width (0.0–1.0)
    pub fn set_width(&mut self, w: f32) { self.width = w.clamp(0.0, 1.0); }
    /// Set base delay in milliseconds
    pub fn set_delay_ms(&mut self, ms: f32) { self.delay_ms = ms.clamp(0.0, 200.0); }
    /// Set reverb send amount (0.0–1.0)
    pub fn set_reverb_send(&mut self, s: f32) { self.reverb_send = s.clamp(0.0, 1.0); }


    pub fn get_depth(&self) -> f32          { self.depth }
    pub fn get_speed(&self) -> f32          { self.speed }
    pub fn get_hpf_cutoff(&self) -> f32     { self.hpf.cutoff() }
    pub fn get_width(&self) -> f32          { self.width }
    pub fn get_delay_ms(&self) -> f32       { self.delay_ms }
    pub fn get_reverb_send(&self) -> f32    { self.reverb_send }

    /// Process one stereo sample, returns (left, right)
    pub fn process(&mut self, input_l: f32, input_r: f32, dt: f32) -> (f32, f32) {
        // mono sum
        let input = 0.5 * (input_l + input_r);
        
        // write into delay buffer
        self.buffer[self.write_idx] = input;
        
        // advance LFO phase
        self.lfo_phase = (self.lfo_phase + self.speed * dt) % 1.0;
        let lfo = (2.0 * std::f32::consts::PI * self.lfo_phase).sin();
        let lfo2 = (2.0 * std::f32::consts::PI * (self.lfo_phase + 0.5)).sin();
        
        // compute variable delays (samples)
        let base = self.delay_ms * 0.001 * self.sample_rate;
        let var = self.depth * 0.005 * self.sample_rate; // depth ~ ±5 ms
        let buf_max = (self.buffer.len() - 2) as f32;
        let d1 = (base + var * lfo).clamp(1.0, buf_max);
        let d2 = (base + var * lfo2).clamp(1.0, buf_max);

        // helper to read fractional delay
        let read = |delay_samples: f32| {
            let buf_len = self.buffer.len() as f32;
            let idx = (self.write_idx as f32 + buf_len - delay_samples) % buf_len;
            let i0 = idx.floor() as usize;
            let frac = idx - idx.floor();
            let i1 = (i0 + 1) % self.buffer.len();
            // linear interpolate
            self.buffer[i0] * (1.0 - frac) + self.buffer[i1] * frac
        };

        let wet1 = read(d1);
        let wet2 = read(d2);

        // increment write index
        self.write_idx = (self.write_idx + 1) % self.buffer.len();

        // apply HPF to wet signals
        let wet1 = self.hpf.process(wet1, dt);
        let wet2 = self.hpf.process(wet2, dt);

        // mix dry/wet
        let mixed_l = input_l * (1.0 - self.depth) + wet1 * self.depth;
        let mixed_r = input_r * (1.0 - self.depth) + wet2 * self.depth;

        // stereo width: scale difference from center
        let center_l = 0.5 * (mixed_l + mixed_r);
        let diff_l = mixed_l - center_l;
        let diff_r = mixed_r - center_l;
        let out_l = center_l + diff_l * self.width;
        let out_r = center_l + diff_r * self.width;

        // (reverb_send can be tapped off separately if desired)
        (out_l, out_r)
    }
}

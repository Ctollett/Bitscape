/// A Schroeder-style reverb with stereo spread.
/// Uses two sets of parallel comb filters (L/R with offset delays) into series all-pass filters.
pub struct Reverb {
    // Left comb filters
    comb_buffers_l: Vec<Vec<f32>>,
    comb_pos_l: Vec<usize>,
    // Right comb filters (slightly different delays for stereo)
    comb_buffers_r: Vec<Vec<f32>>,
    comb_pos_r: Vec<usize>,
    comb_feedback: f32,
    // all-pass filters (shared topology, separate state for L/R)
    ap_buffers_l: Vec<Vec<f32>>,
    ap_pos_l: Vec<usize>,
    ap_buffers_r: Vec<Vec<f32>>,
    ap_pos_r: Vec<usize>,
    ap_feedback: f32,
    // wet/dry mix
    mix: f32,
}

impl Reverb {
    pub fn new(sample_rate: f32) -> Self {
        // Comb delays (ms) — primes for minimal resonance
        let comb_ms_l = [50.0, 56.0, 61.0, 68.0];
        let comb_ms_r = [52.0, 58.0, 63.0, 70.0]; // offset for stereo

        let make_combs = |ms_arr: &[f32]| -> (Vec<Vec<f32>>, Vec<usize>) {
            let delays: Vec<usize> = ms_arr.iter()
                .map(|&ms| (sample_rate * ms / 1000.0) as usize)
                .collect();
            let buffers = delays.iter().map(|&d| vec![0.0; d.max(1)]).collect();
            let pos = vec![0; delays.len()];
            (buffers, pos)
        };

        let (comb_buffers_l, comb_pos_l) = make_combs(&comb_ms_l);
        let (comb_buffers_r, comb_pos_r) = make_combs(&comb_ms_r);

        // All-pass delays
        let ap_ms = [6.0, 8.0];
        let make_aps = |ms_arr: &[f32]| -> (Vec<Vec<f32>>, Vec<usize>) {
            let delays: Vec<usize> = ms_arr.iter()
                .map(|&ms| (sample_rate * ms / 1000.0) as usize)
                .collect();
            let buffers = delays.iter().map(|&d| vec![0.0; d.max(1)]).collect();
            let pos = vec![0; delays.len()];
            (buffers, pos)
        };

        let (ap_buffers_l, ap_pos_l) = make_aps(&ap_ms);
        let (ap_buffers_r, ap_pos_r) = make_aps(&ap_ms);

        Self {
            comb_buffers_l, comb_pos_l,
            comb_buffers_r, comb_pos_r,
            comb_feedback: 0.84,
            ap_buffers_l, ap_pos_l,
            ap_buffers_r, ap_pos_r,
            ap_feedback: 0.5,
            mix: 0.3,
        }
    }

    pub fn set_decay(&mut self, decay: f32) {
        self.comb_feedback = decay.clamp(0.0, 0.99);
    }

    pub fn set_damping(&mut self, damp: f32) {
        self.ap_feedback = damp.clamp(0.0, 0.9);
    }

    pub fn set_mix(&mut self, mix: f32) {
        self.mix = mix.clamp(0.0, 1.0);
    }

    pub fn get_decay(&self) -> f32   { self.comb_feedback }
    pub fn get_damping(&self) -> f32 { self.ap_feedback }
    pub fn get_mix(&self) -> f32     { self.mix }

    /// Process one comb+allpass chain for a single channel
    #[inline]
    fn process_channel(
        input: f32,
        comb_buffers: &mut [Vec<f32>],
        comb_pos: &mut [usize],
        comb_feedback: f32,
        ap_buffers: &mut [Vec<f32>],
        ap_pos: &mut [usize],
        ap_feedback: f32,
    ) -> f32 {
        // Parallel comb filters
        let mut comb_out = 0.0;
        let num_combs = comb_buffers.len();
        for i in 0..num_combs {
            let buf = &mut comb_buffers[i];
            let pos = comb_pos[i];
            let delayed = buf[pos];
            buf[pos] = input + delayed * comb_feedback;
            comb_pos[i] = (pos + 1) % buf.len();
            comb_out += delayed;
        }
        comb_out /= num_combs as f32;

        // Series all-pass filters
        let mut ap_out = comb_out;
        for i in 0..ap_buffers.len() {
            let buf = &mut ap_buffers[i];
            let pos = ap_pos[i];
            let delayed = buf[pos];
            let out = -ap_feedback * ap_out + delayed;
            buf[pos] = ap_out + delayed * ap_feedback;
            ap_pos[i] = (pos + 1) % buf.len();
            ap_out = out;
        }
        ap_out
    }

    /// Process one stereo frame
    pub fn process(&mut self, input_l: f32, input_r: f32, _dt: f32) -> (f32, f32) {
        let wet_l = Self::process_channel(
            input_l,
            &mut self.comb_buffers_l, &mut self.comb_pos_l, self.comb_feedback,
            &mut self.ap_buffers_l, &mut self.ap_pos_l, self.ap_feedback,
        );
        let wet_r = Self::process_channel(
            input_r,
            &mut self.comb_buffers_r, &mut self.comb_pos_r, self.comb_feedback,
            &mut self.ap_buffers_r, &mut self.ap_pos_r, self.ap_feedback,
        );

        let dry_l = input_l * (1.0 - self.mix);
        let dry_r = input_r * (1.0 - self.mix);
        (dry_l + wet_l * self.mix, dry_r + wet_r * self.mix)
    }
}

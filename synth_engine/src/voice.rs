use crate::oscillator::WaveType;

use crate::operator::FMOperator;
use crate::algorithm::FMAlgorithm;
use crate::envelope::Envelope;         // Carrier envelope
use crate::mod_envelope::ModEnvelope;   // Modulator envelope
use crate::noop_envelope::NoopEnvelope;
use crate::lfo::LfoDestination;


pub struct FMVoice {
    pub operators: [FMOperator; 4],
    pub algorithm: FMAlgorithm,
    active: bool,
    note_id: Option<u32>,
    global_feedback_amount: f32,
    pub mod_env_a: ModEnvelope, 
    pub mod_env_b: ModEnvelope,
    pub amp_envelope: Envelope,
    last_output_l: f32,
    last_output_r: f32,
    octave_shift: i32,

}

impl FMVoice {

    /// Convert a 0..1 depth knob to a PM modulation index (β) in cycles.
    /// β controls the peak phase deviation: output = modulator * β.
    /// Quadratic curve gives finer control at low depths.
    /// MAX_INDEX ≈ 7 gives a usable range similar to DX7/Digitone.
    #[inline]
    fn depth_to_index(depth: f32) -> f32 {
        const MAX_INDEX: f32 = 7.0; // peak phase deviation in cycles
        depth * depth * MAX_INDEX
    }
  

 /// Called by Synth::route_lfo for voice-specific params
 pub fn apply_lfo(&mut self, dest: LfoDestination, value: f32) {
    match dest {
        LfoDestination::RatioA => self.set_ratio_a(self.operators[1].frequency_ratio + value),
        LfoDestination::RatioB => {
            // both operator 2 (B1) and operator 3 (B2)
            let new_b1 = self.operators[2].frequency_ratio + value;
            let new_b2 = self.operators[3].frequency_ratio + value;
            self.set_ratio_b(new_b1, new_b2);
        }

        LfoDestination::RatioC => self.set_ratio_c(self.operators[0].frequency_ratio + value),

        LfoDestination::AmpAttack  => self.amp_envelope.attack  = (self.amp_envelope.attack  + value).max(0.0),
        LfoDestination::AmpDecay   => self.amp_envelope.decay   = (self.amp_envelope.decay   + value).max(0.0),
        LfoDestination::AmpSustain => self.amp_envelope.sustain = (self.amp_envelope.sustain + value).clamp(0.0,1.0),
        LfoDestination::AmpRelease => self.amp_envelope.release = (self.amp_envelope.release + value).max(0.0),

        _ => {}, // Other destinations handled at synth-level
    }
}


pub fn new(sample_rate: f32, default_algo: FMAlgorithm) -> Self {
    // Carrier operator envelope: instant attack, no decay, full sustain, quick release
    let default_carrier_env = Envelope::from_digitone(0, 0, 127, 10);
    // Voice amp envelope: same clean init
    let amp_env = Envelope::from_digitone(0, 0, 127, 10);

    // Only the carrier operators need amplitude envelopes now
    Self {
        operators: [
            // Operator C (Carrier)
            FMOperator::new(400.0, sample_rate, WaveType::Sine, Box::new(default_carrier_env.clone()), false),
            // A: Modulator → no envelope
            FMOperator::new(220.0, sample_rate, WaveType::Sine, Box::new(NoopEnvelope), true),
            // B1: Carrier → real envelope
            FMOperator::new(110.0, sample_rate, WaveType::Sine, Box::new(default_carrier_env.clone()), false),
            // B2: Modulator → no envelope
            FMOperator::new(55.0,  sample_rate, WaveType::Sine, Box::new(NoopEnvelope), true),
        ],
        algorithm: default_algo,
        active: false,
        note_id: None,
        global_feedback_amount: 0.0,
        amp_envelope: amp_env,
        octave_shift: 0,

        // 🆕 Modulation envelopes (used only in Voice)
        mod_env_a: ModEnvelope::new_from_values(64, 64, 32), // for Operator A
        mod_env_b: ModEnvelope::new_from_values(64, 64, 64), // for Operator B1/B2
        last_output_l: 0.0,
        last_output_r: 0.0,
    }
}


pub fn note_on(&mut self, note_id: u32, frequency: f32) {
    self.note_id = Some(note_id);
    self.active = true;

    // Set base frequencies...
    self.operators[0].osc.base_frequency = frequency;
    self.operators[1].osc.base_frequency = frequency;
    self.operators[2].osc.base_frequency = frequency;
    self.operators[3].osc.base_frequency = frequency;

    let pitch_mul = 2_f32.powi(self.octave_shift);
    for op in &mut self.operators {
        op.osc.base_frequency = frequency * pitch_mul;
    }

    // Trigger carrier envelopes (if you have amplitude shaping)
    for op in self.operators.iter_mut() {
        op.envelope.note_on();
    }

    // 🆕 Trigger mod envelopes
    self.mod_env_a.note_on();
    self.mod_env_b.note_on();
    self.amp_envelope.note_on();

}



pub fn note_off(&mut self, note_id: u32) {
    if self.note_id == Some(note_id) {
        for op in self.operators.iter_mut() {
            op.envelope.note_off();
        }
        self.mod_env_a.note_off();
        self.mod_env_b.note_off();
        self.amp_envelope.note_off();
        self.note_id = None; // Clear note_id so this voice is "released"
    }
}

/// Returns true if this voice is held (note is down, not yet released).
pub fn is_held(&self) -> bool {
    self.active && self.note_id.is_some()
}



    /// Apply symmetric detune across operator pairs.
    /// A-group (ops 0=C, 1=A) goes sharp, B-group (ops 2=B1, 3=B2) goes flat.
    /// Creates chorus/thickening effect. detune_value is 0-127 (0=none, 127=max).
    pub fn apply_detune(&mut self, detune_value: f32) {
        let factor = if detune_value <= 64.0 {
            detune_value / 640.0
        } else {
            (detune_value - 64.0) / 320.0
        };

        // A-group goes sharp
        self.operators[0].frequency_ratio *= 1.0 + factor;
        self.operators[1].frequency_ratio *= 1.0 + factor;
        // B-group goes flat
        self.operators[2].frequency_ratio *= 1.0 - factor;
        self.operators[3].frequency_ratio *= 1.0 - factor;
    }

    
    
    /// Check if the voice is active.
    pub fn is_active(&self) -> bool {
        self.active
    }
    
    /// Get the note identifier of the voice, if any.
    pub fn get_note_id(&self) -> Option<u32> {
        self.note_id
    }
    
    /// Generate one sample from the voice.
    ///
    /// `delta_time` is the time per sample (e.g., 1.0 / sample_rate).
    /// `mod_depth` scales the modulator's effect on the carrier.



    pub fn generate_sample(
        &mut self,
        delta_time:  f32,
        mod_depth_a: f32,
        mod_depth_b: f32,
        carrier_mix: f32,
    ) -> (f32, f32) {
        // Skip processing entirely if voice is inactive
        if !self.active {
            return (0.0, 0.0);
        }

        // Process mod envelopes exactly once per sample
        let mod_env_a_level = self.mod_env_a.process(delta_time);
        let mod_env_b_level = self.mod_env_b.process(delta_time);

        /********* Step 1: Compute each operator in dependency order *********/
        // Modulation depth is applied per-connection based on source group:
        //   A-group (ops 0,1) → mod_depth_a * mod_env_a
        //   B-group (ops 2,3) → mod_depth_b * mod_env_b
        // The scaled modulator output is a phase offset in cycles (true PM).
        let depth_a = mod_depth_a * mod_env_a_level;
        let depth_b = mod_depth_b * mod_env_b_level;

        let mut outputs: [Option<f32>; 4] = [None; 4];

        // Resolve operators in dependency order: up to 4 iterations guarantees
        // all non-circular dependencies are resolved.
        for _ in 0..4 {
            for i in 0..4 {
                if outputs[i].is_some() { continue; }

                // Check if all non-self sources have been computed
                let deps_ready = self.algorithm.modulations.iter()
                    .all(|&(src, dst)| dst != i || src == i || outputs[src].is_some());

                if !deps_ready { continue; }

                // Accumulate phase-modulation input (in cycles) from all sources
                let mut pm_in = 0.0f32;
                for &(src, dst) in &self.algorithm.modulations {
                    if dst != i { continue; }

                    if src == i {
                        // Self-feedback: bypasses mod depth, has its own level
                        let fb_level = self.operators[src].feedback_amount / 127.0;
                        pm_in += self.operators[src].last_output * fb_level;
                    } else {
                        // External modulator: scale by group depth
                        let raw = outputs[src].unwrap_or(0.0);
                        let depth = match src {
                            0 | 1 => depth_a,
                            _     => depth_b,
                        };
                        let beta = Self::depth_to_index(depth);
                        pm_in += raw * beta;
                    }
                }

                // Generate exactly one sample; pm_in is already in cycles
                let sig = self.operators[i].generate_sample_pm(pm_in, delta_time);
                outputs[i] = Some(sig);
            }
        }

        // Any operator still not computed (true circular dependency) —
        // force-process with zero modulation
        for i in 0..4 {
            if outputs[i].is_none() {
                let sig = self.operators[i].generate_sample_pm(0.0, delta_time);
                outputs[i] = Some(sig);
            }
        }

        /********* Step 2: Route carrier outputs to stereo bus ***************/
        let (mut out_x, mut out_y) = (0.0, 0.0);
        for &(idx, ch) in &self.algorithm.output_routing {
            let s = outputs[idx].unwrap_or(0.0) * carrier_mix;
            if ch == 'X' { out_x += s } else { out_y += s }
        }

        /********* Step 3: Amp envelope + return *****************************/
        let amp = self.amp_envelope.process(delta_time);

        // Auto-deactivate when release finishes (envelope reaches Idle)
        if self.amp_envelope.is_idle() {
            self.active = false;
            self.note_id = None;
            self.last_output_l = 0.0;
            self.last_output_r = 0.0;
            return (0.0, 0.0);
        }

        let l = out_x * amp;
        let r = out_y * amp;
        self.last_output_l = l;
        self.last_output_r = r;
        (l, r)
    }
    
    

    /// Retrieve the last sample pair for debugging.
    pub fn last_output(&self) -> (f32, f32) {
        (self.last_output_l, self.last_output_r)
    }
    
    
    
    
    /// Update the voice's algorithm.
    pub fn set_algorithm(&mut self, new_algo: FMAlgorithm) {
        self.algorithm = new_algo;

        // Determine which operators are pure modulators (appear as modulation
        // sources but NOT in the output routing)
        let is_carrier = |idx: usize| -> bool {
            self.algorithm.output_routing.iter().any(|&(i, _)| i == idx)
        };

        for i in 0..4 {
            let is_mod_source = self.algorithm.modulations.iter().any(|&(src, _)| src == i);
            self.operators[i].is_modulator = is_mod_source && !is_carrier(i);
        }

        // Apply the current global feedback to those newly assigned modulators
        self.set_global_feedback(self.global_feedback_amount);
    }

    pub fn set_attack(&mut self, value: f32) {
        self.amp_envelope.attack = value;
    }
    pub fn set_decay(&mut self, value: f32) {
        self.amp_envelope.decay = value;
    }
    pub fn set_sustain(&mut self, value: f32) {
        self.amp_envelope.sustain = value;
    }
    pub fn set_release(&mut self, value: f32) {
        // never allow true zero
        self.amp_envelope.release = value.max(0.01);
    }

    pub fn set_operator_waveform(&mut self, op_index: usize, wave_type_id: u8) {
        if op_index >= self.operators.len() { return; }
        let wave_type = match wave_type_id {
            0 => WaveType::Sine,
            1 => WaveType::Square,
            2 => WaveType::Saw,
            3 => WaveType::Triangle,
            4 => WaveType::Noise,
            _ => WaveType::Sine,
        };
        self.operators[op_index].set_waveform(wave_type);
    }

    
    pub fn set_octave_shift(&mut self, shift: i32) {
        self.octave_shift = shift.clamp(-4, 4);
    }
    
    // --- New methods for user input ---

    pub fn set_ratio_c(&mut self, ratio: f32) {
        self.operators[0].set_frequency_ratio(ratio.clamp(0.25, 16.0));
    }

    pub fn set_ratio_a(&mut self, ratio: f32) {
        self.operators[1].set_frequency_ratio(ratio.clamp(0.25, 16.0));
    }

    pub fn set_ratio_b(&mut self, ratio_b1: f32, ratio_b2: f32) {
        self.operators[2].set_frequency_ratio(ratio_b1.clamp(0.25, 16.0));
        self.operators[3].set_frequency_ratio(ratio_b2.clamp(0.25, 16.0));
    }

    pub fn set_global_feedback(&mut self, new_feedback: f32) {
        self.global_feedback_amount = new_feedback;
        for (_idx, op) in self.operators.iter_mut().enumerate() {
            if op.is_modulator {
                op.set_feedback_amount(self.global_feedback_amount);
            }
        }
    }
    
    
    

    pub fn update_harm(&mut self, harm: f32) {
        if harm >= 0.0 {
            self.operators[1].set_harm(harm);
            self.operators[2].set_harm(harm);
            self.operators[0].set_harm(0.0);
        } else {
            self.operators[0].set_harm(harm);
            self.operators[1].set_harm(0.0);
            self.operators[2].set_harm(0.0);
        }
    }

}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::algorithm::get_algorithms;

    const SAMPLE_RATE: f32 = 44100.0;
    const DT: f32 = 1.0 / SAMPLE_RATE;

    fn make_voice(algo_idx: usize) -> FMVoice {
        let algos = get_algorithms();
        FMVoice::new(SAMPLE_RATE, algos[algo_idx].clone())
    }

    /// A pure carrier (no modulation) should produce a sine at the correct frequency.
    /// Verify by counting zero-crossings over 1 second.
    #[test]
    fn pure_sine_correct_frequency() {
        let mut voice = make_voice(0);
        let freq = 440.0;
        voice.note_on(0, freq);

        let num_samples = SAMPLE_RATE as usize;
        let mut prev = 0.0f32;
        let mut zero_crossings = 0u32;

        for i in 0..num_samples {
            let (l, _r) = voice.generate_sample(DT, 0.0, 0.0, 1.0);
            if i > 0 && prev.signum() != l.signum() && l != 0.0 {
                zero_crossings += 1;
            }
            prev = l;
        }

        // A sine wave at F Hz has 2*F zero-crossings per second
        let expected_crossings = (freq * 2.0) as u32;
        let tolerance = 4;
        assert!(
            (zero_crossings as i32 - expected_crossings as i32).unsigned_abs() <= tolerance,
            "Expected ~{} zero crossings for {}Hz, got {}",
            expected_crossings, freq, zero_crossings
        );
    }

    /// Each operator should advance its phase exactly once per sample,
    /// regardless of how many modulation entries reference it.
    #[test]
    fn operator_processed_once_per_sample() {
        // Algo 3 has operator A (idx 1) as source in 4 modulation entries.
        // Before the fix, it would be processed 4 times → 4x pitch.
        let mut voice = make_voice(2); // algo index 2 = "Algo 3"
        let freq = 440.0;
        voice.note_on(0, freq);

        let start_phase = voice.operators[1].osc.phase;
        let num_samples = 1000;
        for _ in 0..num_samples {
            voice.generate_sample(DT, 0.0, 0.0, 1.0);
        }
        let end_phase = voice.operators[1].osc.phase;

        // Expected: freq * ratio * num_samples * dt
        // Operator 1 has ratio 1.0, so expected = 440 * 1000 / 44100 ≈ 9.977
        let expected_cycles = freq * 1.0 * (num_samples as f32) * DT;
        let expected_phase = ((start_phase + expected_cycles) % 1.0 + 1.0) % 1.0;
        let diff = (end_phase - expected_phase).abs();
        assert!(
            diff < 0.01 || (1.0 - diff) < 0.01,
            "Operator 1 phase mismatch: expected ~{:.4}, got {:.4} (diff={:.4}). \
             Operator may be processed multiple times per sample.",
            expected_phase, end_phase, diff
        );
    }

    /// With mod_depth=0, output should be a clean sine — smooth, bounded.
    #[test]
    fn zero_mod_depth_is_clean() {
        let mut voice = make_voice(0);
        voice.note_on(0, 440.0);

        let mut max_sample = 0.0f32;
        let mut prev = 0.0f32;
        let mut max_diff = 0.0f32;

        for _ in 0..4410 {
            let (l, _) = voice.generate_sample(DT, 0.0, 0.0, 1.0);
            max_sample = max_sample.max(l.abs());
            let diff = (l - prev).abs();
            max_diff = max_diff.max(diff);
            prev = l;
        }

        assert!(max_sample > 0.9, "Signal too quiet: {}", max_sample);
        assert!(max_sample < 1.1, "Signal too loud: {}", max_sample);

        // Max sample-to-sample diff for 440Hz sine at 44100Hz ≈ 0.0627
        assert!(max_diff < 0.15,
            "Waveform too jagged (max diff = {}), suggests unwanted FM",
            max_diff);
    }

    /// Feedback should use 1-sample-delayed output, not produce NaN/Inf.
    #[test]
    fn feedback_uses_previous_sample() {
        let mut voice = make_voice(0);
        voice.operators[1].feedback_amount = 64.0;
        voice.note_on(0, 440.0);

        for _ in 0..1000 {
            let (l, r) = voice.generate_sample(DT, 0.5, 0.0, 1.0);
            assert!(l.is_finite(), "Left sample is not finite: {}", l);
            assert!(r.is_finite(), "Right sample is not finite: {}", r);
        }
    }

    /// Chain algorithm (Algo 4: B2→B1→A→C) should produce audible
    /// modulation through the full chain when both depth knobs are up.
    #[test]
    fn chain_algorithm_modulates_through() {
        // Algo 4 = index 3: B2→B1→A→C
        let mut voice_mod = make_voice(3);
        let mut voice_dry = make_voice(3);

        voice_mod.note_on(0, 440.0);
        voice_dry.note_on(0, 440.0);

        // Run both: one with modulation, one without
        let mut sum_diff = 0.0f32;
        for _ in 0..4410 {
            let (l_mod, _) = voice_mod.generate_sample(DT, 0.8, 0.8, 1.0);
            let (l_dry, _) = voice_dry.generate_sample(DT, 0.0, 0.0, 1.0);
            sum_diff += (l_mod - l_dry).abs();
        }

        // With depth knobs up, the modulated signal should differ from dry
        assert!(sum_diff > 1.0,
            "Chain modulation had no effect (sum_diff = {}). \
             Depth routing may not reach intermediate operators.",
            sum_diff);
    }

    /// True PM: output should be identical at different sample rates
    /// (same number of cycles produces same waveform shape).
    #[test]
    fn pm_sample_rate_independent() {
        let algos = get_algorithms();

        let mut voice_44 = FMVoice::new(44100.0, algos[0].clone());
        let mut voice_96 = FMVoice::new(96000.0, algos[0].clone());

        voice_44.note_on(0, 440.0);
        voice_96.note_on(0, 440.0);

        // Generate exactly 1 cycle (440Hz) at each rate
        let samples_44 = (44100.0 / 440.0) as usize; // ~100 samples
        let samples_96 = (96000.0 / 440.0) as usize; // ~218 samples

        let dt_44 = 1.0 / 44100.0;
        let dt_96 = 1.0 / 96000.0;

        // Collect peak values with modulation on
        let mut peak_44 = 0.0f32;
        for _ in 0..samples_44 {
            let (l, _) = voice_44.generate_sample(dt_44, 0.5, 0.0, 1.0);
            peak_44 = peak_44.max(l.abs());
        }

        let mut peak_96 = 0.0f32;
        for _ in 0..samples_96 {
            let (l, _) = voice_96.generate_sample(dt_96, 0.5, 0.0, 1.0);
            peak_96 = peak_96.max(l.abs());
        }

        // Both should have similar peak amplitude (PM index is sample-rate independent)
        let ratio = peak_44 / peak_96.max(1e-10);
        assert!(ratio > 0.8 && ratio < 1.25,
            "PM output differs across sample rates (peak@44.1k={:.3}, peak@96k={:.3}, ratio={:.3}). \
             Suggests FM (dt-dependent) rather than true PM.",
            peak_44, peak_96, ratio);
    }
}
    
use crate::oscillator::WaveType;
use crate::operator::FMOperator;
use crate::algorithm::FMAlgorithm;
use crate::envelope::Envelope;

pub struct FMVoice {
    pub operators: [FMOperator; 4],
    pub algorithm: FMAlgorithm,
    active: bool,
    note_id: Option<u32>, // Added field for tracking the note identifier.
}

impl FMVoice {
    /// Create a new FM voice with a default algorithm.
    pub fn new(sample_rate: f32, default_algo: FMAlgorithm) -> Self {
        // Create a default envelope with parameters (attack, decay, sustain, release)
        let default_envelope = Envelope::new(0.01, 0.1, 0.8, 0.2);
        Self {
            operators: [
                FMOperator::new(440.0, sample_rate, WaveType::Sine, 1.0, 0.1, default_envelope.clone()),
                FMOperator::new(220.0, sample_rate, WaveType::Sine, 0.5, 0.1, default_envelope.clone()),
                FMOperator::new(110.0, sample_rate, WaveType::Sine, 0.5, 0.1, default_envelope.clone()),
                FMOperator::new(55.0, sample_rate, WaveType::Sine, 0.5, 0.1, default_envelope),
            ],
            algorithm: default_algo,
            active: false,
            note_id: None, // Initialize note_id as None.
        }
    }

    /// When a note is pressed, trigger note_on on all operator envelopes,
    /// set the carrier frequency, mark the voice as active, and store the note_id.
    pub fn note_on(&mut self, note_id: u32, frequency: f32) {
        for op in self.operators.iter_mut() {
            op.envelope.note_on();
        }
        self.operators[0].osc.frequency = frequency;
        self.operators[0].osc.base_frequency = frequency; // Ensure base frequency is updated
        self.active = true;
        self.note_id = Some(note_id); // Store the note identifier.
    }

    /// When the note is released, check the note_id and trigger note_off on all operator envelopes.
    /// The voice will remain active until the envelopes have decayed.
    pub fn note_off(&mut self, note_id: u32) {
        // Only trigger note_off if the note_id matches.
        if self.note_id == Some(note_id) {
            for op in self.operators.iter_mut() {
                op.envelope.note_off();
            }
        }
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
    pub fn generate_sample(&mut self, delta_time: f32) -> f32 {
        let mut mod_values = [0.0; 4];
        
        // Process modulation routing based on the current algorithm.
        for &(mod_idx, car_idx, depth) in &self.algorithm.modulations {
            let mod_signal = self.operators[mod_idx].generate_sample(0.0, delta_time);
            mod_values[car_idx] += mod_signal * depth;
        }

        // Mix outputs from all designated carriers.
        let mut final_sample = 0.0;
        for &carrier_index in &self.algorithm.carriers {
            final_sample += self.operators[carrier_index].generate_sample(mod_values[carrier_index], delta_time);
        }

        // Average the output if more than one operator is audible.
        final_sample /= self.algorithm.carriers.len() as f32;

        // Mark the voice inactive if the envelope level is very low.
        if self.operators[0].envelope.level <= 0.001 {
            self.active = false;
            self.note_id = None; // Clear the note identifier when the voice is done.
        }

        final_sample
    }

    /// Update the voice's algorithm.
    pub fn set_algorithm(&mut self, new_algo: FMAlgorithm) {
        self.algorithm = new_algo;
    }

    /// Update the frequency ratio of a specific operator.
    pub fn set_operator_frequency_ratio(&mut self, operator_index: usize, ratio: f32) {
        if operator_index < self.operators.len() {
            self.operators[operator_index].set_frequency_ratio(ratio);
        }
    }

    /// Update the feedback level of a specific operator.
    pub fn set_operator_feedback(&mut self, operator_index: usize, feedback: f32) {
        if operator_index < self.operators.len() {
            self.operators[operator_index].set_feedback(feedback);
        }
    }

    /// Update the harmonics of a specific operator.
    pub fn set_operator_harmonics(&mut self, operator_index: usize, harmonics: f32) {
        if operator_index < self.operators.len() {
            self.operators[operator_index].set_harmonics(harmonics);
        }
    }
}

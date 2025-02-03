#[derive(Clone, Debug)]
pub struct FMAlgorithm {
    /// Each tuple is (modulator index, carrier index, modulation depth)
    pub modulations: Vec<(usize, usize, f32)>,
    /// Which operator indices contribute to the final output.
    pub carriers: Vec<usize>,
}

pub fn get_algorithms() -> Vec<FMAlgorithm> {
    vec![

       FMAlgorithm {
            modulations: vec![
                (2, 0, 1.0), // A (Op 2) modulates C (Op 0)
                (1, 0, 1.0), // B2 (Op 1) modulates C (Op 0) [represents the B path as well]
                (1, 3, 1.0), // B2 (Op 1) modulates B1 (Op 3)
            ],
            carriers: vec![0, 3],
        },
        // Algorithm 2: Parallel
        // All modulators feed directly into operator 0.
        FMAlgorithm { 
            modulations: vec![(1, 0, 0.7), (2, 0, 0.7), (3, 0, 0.7)],
            carriers: vec![0],
        },
        // Algorithm 3: Branching
        // Operator 3 modulates operator 1 which modulates operator 0,
        // and operator 2 also modulates operator 0.
        FMAlgorithm { 
            modulations: vec![(3, 1, 0.9), (1, 0, 0.8), (2, 0, 0.5)],
            carriers: vec![0],
        },
        // Algorithm 4: Combination
        // Two branches: one branch (3→1→0) and a second branch where operator 2 modulates both 1 and 0.
        FMAlgorithm { 
            modulations: vec![(3, 1, 0.8), (2, 1, 0.6), (1, 0, 0.8), (2, 0, 0.4)],
            carriers: vec![0],
        },
        // Algorithm 5: Cross Modulation
        // Operator 3 modulates operator 0, operator 2 modulates operator 1, and operator 1 modulates operator 2.
        // For example, we can have operator 0 be audible.
        FMAlgorithm { 
            modulations: vec![(3, 0, 1.0), (2, 1, 0.8), (1, 2, 0.6)],
            carriers: vec![0],
        },
        // Algorithm 6: Hybrid Branching
        // Operator 1 and 2 both modulate the carrier directly, but operator 3 modulates operator 2.
        FMAlgorithm { 
            modulations: vec![(1, 0, 0.7), (2, 0, 0.7), (3, 2, 0.9)],
            carriers: vec![0],
        },
        // Algorithm 7: Direct with a Subtle Modulator
        // All operators feed directly into the carrier with high depths.
        FMAlgorithm { 
            modulations: vec![(3, 0, 2.0), (2, 0, 1.8), (1, 0, 2.5)],
            carriers: vec![0],
        },
        // Algorithm 8: Split Routing
        // Operator 3 splits its output: one branch modulates operator 2 and another modulates operator 1.
        // Then both operators 1 and 2 contribute to the carrier.
        // Here we choose both operator 0 and 1 as audible.
        FMAlgorithm { 
            modulations: vec![(3, 2, 0.8), (3, 1, 0.8), (2, 0, 0.7), (1, 0, 0.6)],
            carriers: vec![0, 1],
        },
    ]
}


// src/algorithm.rs
// ─────────────────────────────────────────────────────────────
// 4-operator FM algorithms (ASCII diagrams – safe for any code-page)
// Operator indices
//   0 = C   (carrier)
//   1 = A   (modulator)
//   2 = B1  (carrier)
//   3 = B2  (modulator)
// ─────────────────────────────────────────────────────────────

#[derive(Clone, Debug)]
pub struct FMAlgorithm {
    /// Human-readable label (shown in the UI)
    pub name: &'static str,

    /// ASCII block diagram (shown in the debug panel)
    pub diagram: &'static str,

    /// (source-op, target-op)  e.g. (1,0) means “op 1 modulates op 0”
    pub modulations: Vec<(usize, usize)>,

    /// Operators that are routed to the audio outs (“carriers”)
    pub carriers: Vec<usize>,

    /// (carrier-idx, channel)  channel ∈ { 'X' (left), 'Y' (right) }
    pub output_routing: Vec<(usize, char)>,
}

impl FMAlgorithm {
    pub fn output_to_x(&self, op: usize) -> bool {
        self.output_routing.iter().any(|&(i, c)| i == op && c == 'X')
    }
    pub fn output_to_y(&self, op: usize) -> bool {
        self.output_routing.iter().any(|&(i, c)| i == op && c == 'Y')
    }

    /// Build a custom algorithm from user-drawn connections.
    /// `modulations`: flat pairs [src0, dst0, src1, dst1, ...]
    /// `carriers`: operator indices that output audio
    /// Any operator not in the carriers list is a pure modulator.
    /// Carriers are routed: first to X, second to Y, rest alternate.
    pub fn custom(modulations: Vec<(usize, usize)>, carriers: Vec<usize>) -> Self {
        let output_routing: Vec<(usize, char)> = carriers.iter().enumerate()
            .map(|(i, &op)| (op, if i % 2 == 0 { 'X' } else { 'Y' }))
            .collect();

        FMAlgorithm {
            name: "Custom",
            diagram: "User-defined routing",
            modulations,
            carriers,
            output_routing,
        }
    }
}

/// Collection of algorithms – the index in this Vec is the number JS sends
pub fn get_algorithms() -> Vec<FMAlgorithm> {
    vec![
        // ─────────────────────────────────────────────────────────
        // Algo 1  (“Bell-like”)
        // ─────────────────────────────────────────────────────────
        FMAlgorithm {
            name: "Algo 1",
            diagram: r#"
            A (feedback)
              |
              +--> C --------------> X
                    ^               |
                    |               |
            B2 ---> B1 -------------+
                      |
                      +--------------------------> Y
        "#,
            // (source, target) pairs
            modulations: vec![
                (1, 1),   // A  → A  (feedback)
                (1, 0),   // A  → C
                (3, 2),   // B2 → B1
                (2, 0),   // B1 → C   ← new, replaces the old A→B2 link
            ],
        
            // Carriers that reach the outputs
            carriers:       vec![0, 2],            // 0 = C, 2 = B1
            output_routing: vec![(0, 'X'), (2, 'Y')],
        },

        // ─────────────────────────────────────────────────────────
        // Algo 2  (“Split feedback”)
        // ─────────────────────────────────────────────────────────
        FMAlgorithm {
            name: "Algo 2",
            diagram: r#"
                A --------------> C --> X
                                    ^
                                    |
                B2 (fb) -> B2 ----> B1 --> Y
        "#,
            //        src tgt
            modulations: vec![
                (1, 0),  // A  -> C
                (3, 3),  // B2 -> B2 (feedback)
                (3, 2),  // B2 -> B1
            ],
        
            carriers:       vec![0, 2],             // 0 = C, 2 = B1
            output_routing: vec![(0, 'X'), (2, 'Y')],
        },


        FMAlgorithm {
            name: "Algo 3",
            diagram: r#"
                A (fb)
                 |
                 +---> C ----> X
                 |
                 +---> B2
                       |
                       v
                      B1 ----> Y
            "#,
        //           src  tgt
        modulations: vec![
            (1, 1),   // A  → A   (feedback)
            (1, 0),   // A  → C
            (1, 3),   // A  → B2
            (1, 2),   // A  → B1
        ],
    
        // Three carriers: 0 = C, 3 = B2, 2 = B1
        carriers: vec![0, 3, 2],
    
        // Stereo routing
        output_routing: vec![
            (0, 'X'),   // C  → left
            (3, 'X'),   // B2 → left
            (2, 'Y'),   // B1 → right
        ],
    },

    FMAlgorithm {
        name: "Algo 4",
        diagram: r#"
    B2 (fb) --> B2 --> B1 --> A --> Y
                              |
                              v
                              C --> X
    "#,
        // B2 self-modulates and modulates B1;
        // B1 modulates A;
        // A modulates C.
        modulations: vec![
            (3, 3), // B2 → B2 (feedback)
            (3, 2), // B2 → B1
            (2, 1), // B1 → A
            (1, 0), // A  → C
        ],
        // Carriers: C (0) and A (1)
        carriers: vec![0, 1],
        // C → left (X), A → right (Y)
        output_routing: vec![
            (0, 'X'),
            (1, 'Y'),
        ],
    },

    FMAlgorithm {
        name: "Algo 5",
        diagram: r#"
    B1 (fb) --> B2
       \          \
        \          v
         >------> A --> Y
                   |
                   v
                   C --> X
    "#,
        // B1 self-modulates and modulates B2;
        // B1 and B2 both modulate A;
        // A modulates C.
        modulations: vec![
            (2, 2), // B1 → B1 (feedback)
            (2, 3), // B1 → B2
            (2, 1), // B1 → A
            (3, 1), // B2 → A
            (1, 0), // A  → C
        ],
        // Carriers: A (1) → Y,  C (0) → X
        carriers: vec![1, 0],
        output_routing: vec![
            (1, 'Y'),
            (0, 'X'),
        ],
    },

    FMAlgorithm {
        name: "Algo 6",
        diagram: r#"
          A (fb) ---> C ---> X
           | \
           |  +--> B1 ---> Y
           v
          B2 ---> C
           \----> B1
        "#,
        // A → A (feedback), A → C, A → B¹; B² → C, B² → B¹
        modulations: vec![
            (1, 1), // A → A (feedback)
            (1, 0), // A → C
            (1, 2), // A → B¹
            (3, 0), // B² → C
            (3, 2), // B² → B¹
        ],
        // Carriers: C (0) → X, B¹ (2) → Y
        carriers:       vec![0, 2],
        output_routing: vec![(0, 'X'), (2, 'Y')],
    },
    
    
    FMAlgorithm {
        name: "Algo 7",
        diagram: r#"
        A-(fb)-->C---->X
        |  \
        |   +------->X
        v
        B2---->B1---->Y
          \          \
           \---------->Y
   
    "#,
        // A→A (fb), A→C
        // B²→B¹
        modulations: vec![
            (1, 1), // A → A (feedback)
            (1, 0), // A → C
            (3, 2), // B² → B¹
        ],
        // Now treat A, C and B¹ as carriers:
        carriers: vec![0, 1, 2],   // 0=C, 1=A, 2=B¹
        output_routing: vec![
            (0, 'X'), // C → left
            (1, 'X'), // A → left
            (2, 'Y'), // B¹ → right
        ],
    },

    FMAlgorithm {
        name: "Algo 8",
        diagram: r#"
         A
         |
         v
         C . . .> X
    
         B2 ----> X
    
         B1 ↻ . . .> Y
    "#,
        // A→C, B1→B1
        modulations: vec![
            (1, 0), // A → C
            (2, 2), // B1 → B1 (feedback)
        ],
        // Carriers: C=0, B2=3, B1=2
        carriers: vec![0, 3, 2],
        // Stereo routing
        output_routing: vec![
            (0, 'X'), // C → left (dashed)
            (3, 'X'), // B2 → left (solid)
            (2, 'Y'), // B1 → right (dashed)
        ],
    },
    
    

    ]

    }

    
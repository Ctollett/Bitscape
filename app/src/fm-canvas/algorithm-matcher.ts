import type { Connection } from './types';

/**
 * Algorithm definitions matching algorithm.rs exactly.
 * Each entry contains the modulation pairs (src, dst) and carrier list.
 */
export const ALGORITHM_DEFS: {
  name: string;
  modulations: [number, number][];
  carriers: number[];
}[] = [
  // Algo 1: A(fb)→C, B2→B1→C
  {
    name: 'Algo 1',
    modulations: [[1, 1], [1, 0], [3, 2], [2, 0]],
    carriers: [0, 2],
  },
  // Algo 2: A→C, B2(fb)→B1
  {
    name: 'Algo 2',
    modulations: [[1, 0], [3, 3], [3, 2]],
    carriers: [0, 2],
  },
  // Algo 3: A(fb)→C,B2,B1
  {
    name: 'Algo 3',
    modulations: [[1, 1], [1, 0], [1, 3], [1, 2]],
    carriers: [0, 3, 2],
  },
  // Algo 4: B2(fb)→B1→A→C
  {
    name: 'Algo 4',
    modulations: [[3, 3], [3, 2], [2, 1], [1, 0]],
    carriers: [0, 1],
  },
  // Algo 5: B1(fb)→B2,A + B2→A, A→C
  {
    name: 'Algo 5',
    modulations: [[2, 2], [2, 3], [2, 1], [3, 1], [1, 0]],
    carriers: [1, 0],
  },
  // Algo 6: A(fb)→C,B1 + B2→C,B1
  {
    name: 'Algo 6',
    modulations: [[1, 1], [1, 0], [1, 2], [3, 0], [3, 2]],
    carriers: [0, 2],
  },
  // Algo 7: A(fb)→C, B2→B1, carriers: C,A,B1
  {
    name: 'Algo 7',
    modulations: [[1, 1], [1, 0], [3, 2]],
    carriers: [0, 1, 2],
  },
  // Algo 8: A→C, B1(fb), carriers: C,B2,B1
  {
    name: 'Algo 8',
    modulations: [[1, 0], [2, 2]],
    carriers: [0, 3, 2],
  },
];

/**
 * Convert modulation list to a Set of "src->dst" strings,
 * excluding self-modulation (feedback is handled separately).
 */
function toEdgeSet(mods: [number, number][]): Set<string> {
  const set = new Set<string>();
  for (const [src, dst] of mods) {
    if (src !== dst) set.add(`${src}->${dst}`);
  }
  return set;
}

/**
 * Jaccard similarity: |intersection| / |union|.
 * Returns 1.0 for perfect match, 0.0 for no overlap.
 */
function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const edge of a) {
    if (b.has(edge)) intersection++;
  }
  const union = a.size + b.size - intersection;
  if (union === 0) return 1.0;
  return intersection / union;
}

/**
 * Given user-drawn connections, find the best-matching algorithm index (0-7).
 *
 * Strategy:
 * 1. Strip self-loops (those map to feedback, not algorithm)
 * 2. Compare remaining edges against each algorithm's non-self modulations
 * 3. Rank by Jaccard similarity
 * 4. Tie-break: prefer simpler algorithms (fewer extra connections)
 */
export function matchAlgorithm(userConnections: Connection[]): number {
  const userEdges = toEdgeSet(
    userConnections
      .filter((c) => c.src !== c.dst)
      .map((c) => [c.src, c.dst] as [number, number]),
  );

  // No non-self connections → default to Algo 8 (simplest: A→C)
  if (userEdges.size === 0) return 7;

  let bestIndex = 0;
  let bestScore = -1;
  let bestExtraCount = Infinity;

  for (let i = 0; i < ALGORITHM_DEFS.length; i++) {
    const algoEdges = toEdgeSet(ALGORITHM_DEFS[i].modulations);
    const score = jaccardSimilarity(userEdges, algoEdges);

    // Count algo edges not in user's drawing (extra complexity)
    let extraCount = 0;
    for (const edge of algoEdges) {
      if (!userEdges.has(edge)) extraCount++;
    }

    if (score > bestScore || (score === bestScore && extraCount < bestExtraCount)) {
      bestScore = score;
      bestIndex = i;
      bestExtraCount = extraCount;
    }
  }

  return bestIndex;
}

/** Returns carrier operator indices for a given algorithm index. */
export function getCarriers(algoIndex: number): number[] {
  return ALGORITHM_DEFS[algoIndex]?.carriers ?? [0];
}

/** Returns the resolved modulation pairs for a given algorithm. */
export function getModulations(algoIndex: number): [number, number][] {
  return ALGORITHM_DEFS[algoIndex]?.modulations ?? [];
}

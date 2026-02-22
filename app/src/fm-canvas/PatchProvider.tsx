import { useEffect, useReducer, type ReactNode } from 'react';
import { PatchContext } from './patch-context';
import { patchReducer } from './patch-reducer';
import { saveLastSession, loadLastSession } from './patch-storage';
import { useEngineSync } from './use-engine-sync';
import { createInitialPatch } from './constants';

export function PatchProvider({ children }: { children: ReactNode }) {
  const [patch, dispatch] = useReducer(patchReducer, undefined, () => {
    const raw = loadLastSession() ?? createInitialPatch();
    // Migrate stale sessions: old system stored filterCutoff as raw Hz (e.g. 20000)
    // and filterResonance as raw Q (e.g. 0.707). New system uses 0-127 sliders.
    // We can't reverse-map cleanly (20000 Hz → slider 127 → still 20000 Hz),
    // so just reset filter fields to sensible defaults.
    const defaults = createInitialPatch();
    if (raw.filterCutoff > 127 || raw.filterResonance < 0.5) {
      return {
        ...raw,
        filterCutoff:    defaults.filterCutoff,
        filterResonance: defaults.filterResonance,
      };
    }
    return raw;
  });

  // Sync patch changes to the WASM engine
  useEngineSync(patch);

  useEffect(() => { saveLastSession(patch); }, [patch])

  return (
    <PatchContext.Provider value={{ patch, dispatch }}>
      {children}
    </PatchContext.Provider>
  );
}

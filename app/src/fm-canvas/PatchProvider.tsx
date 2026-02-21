import { useReducer, type ReactNode } from 'react';
import { PatchContext } from './patch-context';
import { patchReducer } from './patch-reducer';
import { useEngineSync } from './use-engine-sync';
import { createInitialPatch } from './constants';

export function PatchProvider({ children }: { children: ReactNode }) {
  const [patch, dispatch] = useReducer(patchReducer, undefined, createInitialPatch);

  // Sync patch changes to the WASM engine
  useEngineSync(patch);

  return (
    <PatchContext.Provider value={{ patch, dispatch }}>
      {children}
    </PatchContext.Provider>
  );
}

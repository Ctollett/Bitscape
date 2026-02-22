import type { FMCanvasPatch } from "./types";


export interface SavedPatch {
    id: string;
    name: string;
    createdAt: number;
    patch: FMCanvasPatch;
}


const LIBRARY_KEY = 'bitscape_library';
const SESSION_KEY = 'bitscape_last_session';


export const loadLibrary = (): SavedPatch[] => {
    try {
        const raw = localStorage.getItem(LIBRARY_KEY)
        return raw ? JSON.parse(raw) : [];
    } catch {
        return []
    }

}


export const saveToLibrary = (name: string, patch: FMCanvasPatch): SavedPatch => {
    const library = loadLibrary();

    const entry: SavedPatch = {
        id: crypto.randomUUID(),
        name: name,
        createdAt: Date.now(),
        patch: patch,
    }

    library.push(entry)
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library))

    return entry;

}

export const deleteFromLibrary = (id: string): void => {
    const next = loadLibrary().filter((item) => item.id !== id);
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
}

export const renameInLibrary = (id: string, name: string): void => {
    const library = loadLibrary();
    
    const next = library.map((entry) => 
        entry.id === id ? { ...entry, name } : entry
    )

    localStorage.setItem(LIBRARY_KEY, JSON.stringify(next))
    
}

export const saveLastSession = (patch: FMCanvasPatch) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(patch));
}


export const loadLastSession = (): FMCanvasPatch | null => {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
        
    } catch {
        return null
    }
}

export const exportPatchFile = (patch: FMCanvasPatch, name: string): void => {
    const json = JSON.stringify(patch, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export const importPatchFile = (file: File): Promise<FMCanvasPatch> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const patch = JSON.parse(e.target!.result as string);
                resolve(patch);
            } catch {
                reject(new Error('Invalid patch file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
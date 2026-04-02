type NoteOnCallback = (midiNote: number, freq: number) => void;
type NoteOffCallback = (midiNote: number) => void;

const noteOnListeners = new Set<NoteOnCallback>();
const noteOffListeners = new Set<NoteOffCallback>();

export function emitNoteOn(midiNote: number, freq: number): void {
  noteOnListeners.forEach(cb => cb(midiNote, freq));
}

export function emitNoteOff(midiNote: number): void {
  noteOffListeners.forEach(cb => cb(midiNote));
}

export function onNoteOn(cb: NoteOnCallback): () => void {
  noteOnListeners.add(cb);
  return () => noteOnListeners.delete(cb);
}

export function onNoteOff(cb: NoteOffCallback): () => void {
  noteOffListeners.add(cb);
  return () => noteOffListeners.delete(cb);
}

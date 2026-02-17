/* Tiny ASCII-only TextDecoder for AudioWorklet scopes that lack it */
if (typeof TextDecoder === 'undefined') {
  globalThis.TextDecoder = class {
    decode(u8) {
      if (!u8) return '';
      const view = u8 instanceof Uint8Array ? u8 : new Uint8Array(u8);
      let s = '';
      for (let i = 0; i < view.length; i++) s += String.fromCharCode(view[i]);
      return s;
    }
  };
}

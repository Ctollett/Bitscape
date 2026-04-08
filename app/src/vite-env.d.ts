/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

declare namespace JSX {
  interface IntrinsicElements {
    'media-shader': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      width?: string;
      height?: string;
      'fragment-shader'?: string;
      uniforms?: string;
    };
  }
}

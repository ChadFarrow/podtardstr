/// <reference types="vite/client" />

// WebLN V4V Web Component types
declare namespace JSX {
  interface IntrinsicElements {
    'webln-v4v': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'value-block'?: string;
      'suggested-amount'?: string;
      'recipient-name'?: string;
      'podcast-title'?: string;
      'episode-title'?: string;
      header?: string;
      footer?: string;
    };
  }
}

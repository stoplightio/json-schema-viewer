import { IJSONSchemaViewerTheme } from '../types';

export const dark: IJSONSchemaViewerTheme = {
  base: 'dark',

  canvas: {
    bg: '#111',
    fg: '#fff',
    error: 'red',
    muted: 'rgba(255, 255, 255, 0.6)',
  },

  divider: {
    bg: '#bababa',
  },

  row: {
    hoverBg: '#333',
    hoverFg: '#fff',
    evenBg: '#232222',
  },

  types: {
    object: '#83c1ff',
    array: '#7dff75',
    allOf: '#b89826',
    oneOf: '#b89826',
    anyOf: '#b89826',
    null: '#ff7f50',
    integer: '#e03b36',
    number: '#e03b36',
    boolean: '#ff69b4',
    binary: '#8ccda3',
    string: '#19c5a0',
    $ref: '#a359e2',
  },
};

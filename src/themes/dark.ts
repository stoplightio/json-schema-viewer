import { ThemeZones } from '@stoplight/ui-kit';
import { themeTypes, themeZones } from '../theme';

export const dark: ThemeZones<themeZones, themeTypes> = {
  'tree-list': {
    base: 'dark',

    canvas: {
      invalid: 'red',
    },

    node: {
      hoverBg: '#333',
      hoverFg: '#fff',
      evenBg: '#232222',
    },
  },

  'json-schema-viewer': {
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
  },
};

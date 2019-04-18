import { createThemedModule } from '@stoplight/ui-kit';

const { useTheme, ThemeProvider } = createThemedModule();

export { useTheme, ThemeProvider };

export const themes = ['dark', 'light'];

export const zones = {
  'tree-list': ({ base }) =>
    base === 'dark'
      ? {
        canvas: {
          bg: '#111',
          fg: '#fff',
          invalid: 'red',
        },

        node: {
          dragBg: 'rgba(255, 255, 255, .9)',
          dragFg: '#111',
          activeFg: '#111',
          activeBg: 'rgba(255, 255, 255, .8)',
          hoverBg: 'rgba(255, 255, 255, .4)',
          highlightedBg: 'rgba(255, 255, 255, .2)',
          highlightedFg: '#ff',
        },
      }
      : {
        canvas: {
          bg: '#fff',
          fg: '#111',
          invalid: 'red',
        },

        node: {
          dragBg: 'rgba(0, 0, 0, .9)',
          dragFg: '#fff',
          activeFg: '#fff',
          activeBg: 'rgba(0, 0, 0, .8)',
          hoverBg: 'rgba(0, 0, 0, .4)',
          highlightedBg: 'rgba(0, 0, 0, .2)',
          highlightedFg: '#111',
        },
      },
  'json-schema-viewer': ({ base }) =>
    base === 'dark'
      ? {
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
        }
      : {
          canvas: {
            bg: '#fff',
            fg: '#111',
            error: 'red',
            muted: 'rgba(0, 0, 0, 0.5)',
          },

          divider: {
            bg: '#dae1e7',
          },

          row: {
            hoverBg: '#e9e9e9',
            hoverFg: '#111',
            evenBg: '#f3f3f3',
          },

          types: {
            object: '#00f',
            array: '#008000',
            allOf: '#B8860B',
            oneOf: '#B8860B',
            anyOf: '#B8860B',
            null: '#ff7f50',
            integer: '#a52a2a',
            number: '#a52a2a',
            boolean: '#ff69b4',
            binary: '#66cdaa',
            string: '#008080',
            $ref: '#8a2be2',
          },
        },
};

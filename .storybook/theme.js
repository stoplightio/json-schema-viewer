import { createThemedModule } from '@stoplight/ui-kit';

const { useTheme, ThemeProvider } = createThemedModule();

export { useTheme, ThemeProvider };

export const themes = ['dark', 'light'];

export const zones = {
  'json-schema-viewer': ({ base }) => base === 'dark'
    ? {
      canvas: {
        bg: '#111',
        fg: '#fff',
        error: 'red',
        muted: 'rgba(255, 255, 255, 0.4)'
      },

      divider: {
        bg: '#bababa',
      },

      row: {
        hoverBg: '#999',
        hoverFg: '#222',
        evenBg: '#232222',
      },

      types: {
        object: '#00f',
        array: '#008000',
        allOff: '#B8860B',
        oneOf: '#B8860B',
        anyOf: '#B8860B',
        null: '#ff7f50',
        integer: '#a52a2a',
        number: '#a52a2a',
        boolean: '#ff69b4',
        binary: '#66cdaa',
        string: '#008080',
        $ref: '#8a2be2',
      }
    } : {
      canvas: {
        bg: '#fff',
        fg: '#111',
        error: 'red',
        muted: 'rgba(0, 0, 0, 0.4)'
      },

      divider: {
        bg: '#dae1e7',
      },

      row: {
        hoverBg: '#888',
        hoverFg: '#111',
        evenBg: '#e4e4e4',
      },


      types: {
        object: '#00f',
        array: '#008000',
        allOff: '#B8860B',
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

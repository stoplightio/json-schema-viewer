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
        evenBg: '#333',
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
    },
};

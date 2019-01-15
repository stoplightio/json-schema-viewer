export const useTheme = () => ({
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
  },
});

export const ThemeZone = jest.fn(({ children }) => children);
// @ts-ignore
ThemeZone.displayName = 'ThemeZone';

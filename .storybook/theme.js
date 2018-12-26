import { createThemedModule } from '@stoplight/ui-kit';

const { useTheme, ThemeProvider } = createThemedModule();

export { useTheme, ThemeProvider };

export const themes = ['dark', 'light'];

export const zones = {};

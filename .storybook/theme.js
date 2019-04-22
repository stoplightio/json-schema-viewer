import { createThemedModule } from '@stoplight/ui-kit';
import { dark } from '../src/themes/dark';
import { light } from '../src/themes/light';

const { useTheme, ThemeProvider } = createThemedModule();

export { useTheme, ThemeProvider };

export const themes = ['dark', 'light'];

export const zones = {
  'tree-list': ({ base }) => base === 'dark'  ? dark['tree-list'] : light['tree-list'],
  'json-schema-viewer': ({ base }) => base === 'dark'  ? dark['json-schema-viewer'] : light['json-schema-viewer'],
};

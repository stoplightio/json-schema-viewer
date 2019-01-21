import { createThemedModule } from '@stoplight/ui-kit';
import { IJSONSchemaViewerTheme } from './types';

export type themeZones = 'json-schema-viewer';

export const { useTheme, ThemeZone, ThemeProvider } = createThemedModule<themeZones, IJSONSchemaViewerTheme>();

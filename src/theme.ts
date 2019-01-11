import { createThemedModule } from '@stoplight/ui-kit';
import { IJSONSchemaViewerTheme } from './types';

export type themeZones = string;

export const { useTheme, ThemeZone } = createThemedModule<themeZones, IJSONSchemaViewerTheme>();

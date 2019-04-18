import { ITreeListTheme } from '@stoplight/tree-list';
import { createThemedModule, ICustomTheme } from '@stoplight/ui-kit';

export type themeZones = 'json-schema-viewer' | 'tree-list';
export type themeTypes = IJsonSchemaViewerTheme | ITreeListTheme;

export const { useTheme, ThemeZone, ThemeProvider } = createThemedModule<themeZones, themeTypes>();

export interface IJsonSchemaViewerTheme extends ICustomTheme {
  canvas: {
    bg: string;
    fg: string;
    error: string;
    muted: string;
  };

  types: {
    array: string;
    object: string;
    allOf: string;
    oneOf: string;
    anyOf: string;
    null: string;
    integer: string;
    number: string;
    boolean: string;
    binary: string;
    string: string;
    $ref: string;
  };

  divider: {
    bg: string;
  };
}

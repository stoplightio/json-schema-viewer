import { createThemedModule, ICustomTheme } from '@stoplight/ui-kit';

export type themeZones = 'json-schema-viewer';

export const { useTheme, ThemeZone, ThemeProvider } = createThemedModule<themeZones, IJSONSchemaViewerTheme>();

export interface IJSONSchemaViewerTheme extends ICustomTheme {
  canvas: {
    bg: string;
    fg: string;
    error: string;
    muted: string;
  };

  row: {
    hoverFg?: string;
    hoverBg: string;
    evenFg?: string;
    evenBg: string;
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

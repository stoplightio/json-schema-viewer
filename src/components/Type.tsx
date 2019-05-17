import { Box, IBoxCSS } from '@stoplight/ui-kit';
import { JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';
import { IJsonSchemaViewerTheme, useTheme } from '../theme';
import { ITreeNodeMeta, JSONSchema4CombinerName } from '../types';

export const Type: React.FunctionComponent<IType> = ({ type, subtype, children }) => {
  const theme = useTheme() as IJsonSchemaViewerTheme;
  const css = rowStyles(theme, { type });

  return (
    <Box as="span" css={css}>
      {type === 'array' && subtype && subtype !== 'array' ? `array[${subtype}]` : type}
      {children}
    </Box>
  );
};

export interface IType {
  type: JSONSchema4TypeName | JSONSchema4CombinerName | '$ref';
  subtype?: ITreeNodeMeta['subtype'];
}

export const rowStyles = (theme: IJsonSchemaViewerTheme, { type }: IType): IBoxCSS => {
  return type !== undefined && type in theme.types && { color: theme.types[type] };
};

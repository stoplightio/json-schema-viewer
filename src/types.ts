import { Dictionary, ISchema } from '@stoplight/types';
import { ICustomTheme } from '@stoplight/ui-kit';
import { ReactNodeArray } from 'react';

export interface ICommonProps {
  schemas: any;
  schema?: ISchema;
  defaultExpandedDepth: number;
  prop?: ISchema;
  parentName?: string;
  rowElems: ReactNodeArray;
  expandedRows: Dictionary<boolean>;
  jsonPath: string;
  propName?: string;
  required?: boolean | string[];
  hideInheritedFrom?: boolean;
  hideRoot?: boolean;

  toggleExpandRow(rowKey: string, expanded: boolean): void;
}

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

  divider: {
    bg: string;
  };
}

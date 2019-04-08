import { Dictionary, ISchema, JsonPath } from '@stoplight/types';
import { ICustomTheme } from '@stoplight/ui-kit';
import { ReactNodeArray } from 'react';

export interface ICommonProps {
  originalSchema?: ISchema;
  schema?: ISchema;
  defaultExpandedDepth: number;
  prop?: ISchema;
  parentName?: string;
  rowElems: ReactNodeArray;
  expandedRows: Dictionary<boolean>;
  path: JsonPath;
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

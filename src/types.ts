import { Dictionary, ISchema, Omit } from '@stoplight/types';
import { ICustomTheme } from '@stoplight/ui-kit';
import { ReactElement } from 'react';

export interface IProp extends ISchema {
  allOf?: IProp[];
  anyOf?: IProp[];
  oneOf?: IProp[];
  properties?: IProp[];
  required?: IProp[];
  items?: IProp;
  type: 'string' | 'object' | 'array' | 'number' | string;
}

export interface IResolvedProp extends Omit<IProp, 'type'> {
  type: '@circular' | string;
  __inheritedFrom?: {
    name: string;
    ref: string;
  };
}

export interface ICommonProps {
  schemas: any;
  schema?: IProp | IResolvedProp;
  defaultExpandedDepth: number;
  prop?: IProp | IResolvedProp;
  parentName?: string;
  rowElems: Array<ReactElement<any>>;
  expandedRows: Dictionary<boolean>;
  jsonPath: string;
  propName?: string;
  required?: boolean | string[];
  hideInheritedFrom?: boolean;
  hideRoot?: boolean;

  toggleExpandRow(rowKey: string, expanded: boolean): void;
}

export interface IJSONSchemaViewerTheme extends ICustomTheme {
  canvas?: {
    bg: string;
    fg: string;
    invalid: string;
  };

  row?: {
    fg?: string;
    bg?: string;
    dragBg: string;
    dragFg: string;
    hoverFg: string;
    hoverBg: string;
    activeFg: string;
    activeBg: string;
    highlightedFg: string;
    highlightedBg: string;
  };
}

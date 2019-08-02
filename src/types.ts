import { IRowRendererOptions, TreeListNode, TreeStore } from '@stoplight/tree-list';
import { Dictionary, JsonPath } from '@stoplight/types';
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import * as React from 'react';

export const enum SchemaKind {
  Any = 'any',
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Null = 'null',
  Array = 'array',
  Object = 'object',
}

export type JSONSchema4CombinerName = 'allOf' | 'anyOf' | 'oneOf';

export type JSONSchema4Annotations = 'title' | 'description' | 'default' | 'examples';

export type JSONSchema4Metadata = 'id' | '$schema';

export interface ICombinerNode {
  id: string;
  readonly combiner: JSONSchema4CombinerName;
  properties?: JSONSchema4[];
  annotations: Pick<JSONSchema4, JSONSchema4Annotations>;
  readonly type?: JSONSchema4TypeName | JSONSchema4TypeName[];
}

export interface IBaseNode extends Pick<JSONSchema4, 'enum'> {
  id: string;
  readonly type?: JSONSchema4TypeName | JSONSchema4TypeName[];
  annotations: Pick<JSONSchema4, JSONSchema4Annotations>;
  validations: Dictionary<unknown>;
}

export interface IRefNode {
  id: string;
  $ref: string;
}

export interface IArrayNode extends IBaseNode, Pick<JSONSchema4, 'items' | 'additionalItems'> {}

export interface IObjectNode
  extends IBaseNode,
    Pick<JSONSchema4, 'properties' | 'patternProperties' | 'additionalProperties'> {}

export interface IObjectPropertyNode extends IBaseNode {
  name: string;
}

export type SchemaNode = ICombinerNode | IBaseNode | IArrayNode | IObjectNode | IObjectPropertyNode | IRefNode;

export interface ITreeNodeMeta {
  name?: string;
  additional?: IArrayNode['additionalItems'] | IObjectNode['additionalProperties'];
  path: JsonPath;
  divider?: string;
  subtype?: IBaseNode['type'] | string;
  expanded?: boolean;
  required?: boolean;
  inheritedFrom?: string;
  pattern?: boolean;
  $ref?: string;
}

export type SchemaNodeWithMeta = SchemaNode & ITreeNodeMeta;

export type SchemaTreeListNode = TreeListNode<SchemaNodeWithMeta>;

export type GoToRefHandler = (path: string, node: SchemaNodeWithMeta) => void;

export type RowRenderer = (
  node: SchemaTreeListNode,
  rowOptions: IRowRendererOptions,
  treeStore: TreeStore,
) => React.ReactNode;

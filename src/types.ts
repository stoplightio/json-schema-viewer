import { IRowRendererOptions, TreeListNode, TreeStore } from '@stoplight/tree-list';
import { Dictionary } from '@stoplight/types';
import {
  JSONSchema4,
  JSONSchema4TypeName,
  JSONSchema6,
  JSONSchema6TypeName,
  JSONSchema7,
  JSONSchema7TypeName,
} from 'json-schema';
import * as React from 'react';

export enum SchemaKind {
  Any = 'any',
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Null = 'null',
  Array = 'array',
  Object = 'object',
}

export type JSONSchemaCombinerName = 'allOf' | 'anyOf' | 'oneOf';

export type JSONSchemaAnnotations = 'title' | 'description' | 'default' | 'examples';

export interface ICombinerNode {
  id: string;
  readonly combiner: JSONSchemaCombinerName;
  properties?: JSONSchema[];
  annotations: Pick<JSONSchema, JSONSchemaAnnotations>;
  readonly type?: JSONSchema['type'];
  title?: string;
}

export interface IBaseNode extends Pick<JSONSchema, 'enum'> {
  id: string;
  readonly type?: JSONSchema['type'];
  annotations: Partial<Pick<JSONSchema, JSONSchemaAnnotations>>;
  validations: Dictionary<unknown>;
  required?: string[];
  title?: string;
}

export interface IRefNode {
  id: string;
  $ref: string | null;
  title?: string;
}

export interface IArrayNode extends IBaseNode, Pick<JSONSchema, 'items' | 'additionalItems'> {}

export interface IObjectNode
  extends IBaseNode,
    Pick<JSONSchema, 'properties' | 'patternProperties' | 'additionalProperties'> {}

export interface IObjectPropertyNode extends IBaseNode {
  name: string;
}

export type SchemaNode = ICombinerNode | IBaseNode | IArrayNode | IObjectNode | IObjectPropertyNode | IRefNode;

export type SchemaTreeListNode = TreeListNode;

export type GoToRefHandler = (path: string, node: IRefNode) => void;

export type RowRenderer = (
  node: TreeListNode,
  rowOptions: IRowRendererOptions,
  treeStore: TreeStore,
) => React.ReactNode;

export type ViewMode = 'read' | 'write' | 'standalone';

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

export type JSONSchemaTypeName = JSONSchema4TypeName | JSONSchema6TypeName | JSONSchema7TypeName;

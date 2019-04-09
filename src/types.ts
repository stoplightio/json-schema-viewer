import { Dictionary, JsonPath } from '@stoplight/types';
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';

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

export interface ICombinerNode {
  readonly combiner: JSONSchema4CombinerName;
  properties?: JSONSchema4[];
  annotations: Pick<JSONSchema4, JSONSchema4Annotations>;
}

export interface IBaseNode extends Pick<JSONSchema4, 'enum'> {
  readonly type?: JSONSchema4TypeName | JSONSchema4TypeName[];
  annotations: Pick<JSONSchema4, JSONSchema4Annotations>;
  validations: Dictionary<unknown>;
}

export interface IRefNode {
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
  additional?: IArrayNode['additionalItems'] | IObjectNode['additionalProperties'];
  level: number;
  path: JsonPath;
  showDivider?: boolean;
  subtype?: IBaseNode['type'];
  expanded?: boolean;
  required?: boolean;
  inheritedFrom?: string;
}

export type SchemaTreeNode = SchemaNode & ITreeNodeMeta;

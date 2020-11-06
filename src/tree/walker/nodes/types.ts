import { RegularNode } from './RegularNode';
import { ReferenceNode } from './ReferenceNode';
import { ErrorNode } from './ErrorNode';

export type SchemaNode = RegularNode | ReferenceNode | ErrorNode;

export enum SchemaNodeKind {
  Any = 'any',
  String = 'string',
  Number = 'number',
  Integer = 'integer',
  Boolean = 'boolean',
  Null = 'null',
  Array = 'array',
  Object = 'object',
}

export enum SchemaCombinerName {
  AllOf = 'allOf',
  AnyOf = 'anyOf',
  OneOf = 'oneOf',
}

export type SchemaAnnotations = 'title' | 'description' | 'default' | 'examples';

export type JSONSchema4Metadata = 'id' | '$schema';

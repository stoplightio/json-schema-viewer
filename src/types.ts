import type { ReferenceNode, SchemaNode } from '@stoplight/json-schema-tree';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import * as React from 'react';

export type GoToRefHandler = (node: ReferenceNode) => void;

export interface SchemaRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
}

export type RowAddonRenderer = (props: SchemaRowProps) => React.ReactNode;

export interface ExtensionRowProps {
  schemaNode: SchemaNode;
  nestingLevel: number;
  vendorExtensions: Record<string, unknown>;
}

export type ExtensionAddonRenderer = (props: ExtensionRowProps) => React.ReactNode;

export type ViewMode = 'read' | 'write' | 'standalone';

export type JSONSchema = JSONSchema4 | JSONSchema6 | JSONSchema7;

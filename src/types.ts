import type { ReferenceNode } from '@stoplight/json-schema-tree';

export type GoToRefHandler = (node: ReferenceNode) => void;

export type ViewMode = 'read' | 'write' | 'standalone';

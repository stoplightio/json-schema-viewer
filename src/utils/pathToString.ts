import { SchemaTreeNode } from '../types';

export const pathToString = (node: SchemaTreeNode) => node.path.join('.');

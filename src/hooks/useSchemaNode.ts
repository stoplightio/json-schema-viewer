import { SchemaNode } from '@stoplight/json-schema-tree';
import { useContext } from 'react';

import { SchemaNodeContext } from '../contexts';

export function useSchemaNode(): SchemaNode {
  return useContext(SchemaNodeContext);
}

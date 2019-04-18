import { TreeStore } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import { useMemo } from 'react';
import { renderSchema } from '../utils/renderSchema';

export const useProperties = (schema: JSONSchema4, dereferencedSchema: JSONSchema4 | undefined, store: TreeStore) => {
  return useMemo(() => Array.from(renderSchema(schema, dereferencedSchema, store)), [
    schema,
    dereferencedSchema,
    store,
  ]);
};

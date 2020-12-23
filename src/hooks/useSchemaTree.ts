import { useContext } from 'react';

import { SchemaTreeContext } from '../contexts';

export function useSchemaTree() {
  return useContext(SchemaTreeContext);
}

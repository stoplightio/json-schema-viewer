import { useContext } from 'react';
import { SchemaNodeProviderContext } from '../components/SchemaNodeProvider';

export function useSchemaNode() {
  return useContext(SchemaNodeProviderContext);
}

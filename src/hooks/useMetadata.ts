import { JSONSchema4 } from 'json-schema';
import { useMemo } from 'react';
import { getMetadata } from '../utils/getMetadata';

export const useMetadata = (schema: JSONSchema4) => {
  return useMemo(() => getMetadata(schema), [schema]);
};

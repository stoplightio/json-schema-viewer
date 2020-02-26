import { JSONSchema4 } from 'json-schema';
import { SchemaKind } from '../../types';
import { getCombiner } from '../../utils/getCombiner';
import { getPrimaryType } from '../../utils/getPrimaryType';

export const canStepIn = (fragment: JSONSchema4) => {
  if (getCombiner(fragment)) {
    return true;
  }

  const type = getPrimaryType(fragment);
  return type === SchemaKind.Array || type === SchemaKind.Object;
};

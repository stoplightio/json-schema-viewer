import { JSONSchema4 } from 'json-schema';
import { SchemaNodeKind } from '../../types';
import { getCombiners } from '../../utils/getCombiners';
import { getPrimaryType } from '../../utils/getPrimaryType';

export const canStepIn = (fragment: JSONSchema4) => {
  if (getCombiners(fragment) !== void 0) {
    return true;
  }

  const type = getPrimaryType(fragment);
  return type === SchemaNodeKind.Array || type === SchemaNodeKind.Object;
};

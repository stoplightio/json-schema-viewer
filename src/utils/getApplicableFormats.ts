import { RegularNode, SchemaNodeKind } from '@stoplight/json-schema-tree';

import { COMMON_JSON_SCHEMA_AND_OAS_FORMATS } from '../consts';

export function getApplicableFormats(schemaNode: RegularNode): [type: SchemaNodeKind, format: string] | null {
  if (schemaNode.format === null) {
    return null;
  }

  if (schemaNode.types !== null) {
    for (const type of schemaNode.types) {
      if (!(type in COMMON_JSON_SCHEMA_AND_OAS_FORMATS)) continue;

      if (COMMON_JSON_SCHEMA_AND_OAS_FORMATS[type].includes(schemaNode.format)) {
        return [type, schemaNode.format];
      }
    }
  }

  return [SchemaNodeKind.String, schemaNode.format];
}

import { RegularNode, SchemaNodeKind } from '@stoplight/json-schema-tree';

import { COMMON_JSON_SCHEMA_AND_OAS_FORMATS } from '../consts';

export function getApplicableFormats(schemaNode: RegularNode): [type: SchemaNodeKind, format: string] | null {
  // JSON Schema itself doesn't directly support defining binary data types.
  // Within the http-spec repository, we address this limitation using
  // OpenAPI features i.e. `contentMediaType: 'application/octet-stream'`.
  // which is specific to OpenAPI and not supported by JSON Schema itself.

  if (
    schemaNode.fragment['contentMediaType'] === 'application/octet-stream' &&
    schemaNode.types &&
    schemaNode.types.length > 0
  ) {
    return [schemaNode.types[0], 'binary'];
  }

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

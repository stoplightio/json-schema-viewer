import { RegularNode, SchemaNodeKind } from '@stoplight/json-schema-tree';

import { COMMON_JSON_SCHEMA_AND_OAS_FORMATS } from '../consts';

export function getApplicableFormats(schemaNode: RegularNode): [type: SchemaNodeKind, format: string] | null {
  // JSON Schema itself doesn't directly support defining binary data types.
  // To address this limitation within the http-spec repository, we use
  // `contentMediaType: 'application/octet-stream'` to indicate binary content.

  if (schemaNode.format === null) {
    if (
      schemaNode.fragment['contentMediaType'] === 'application/octet-stream' &&
      schemaNode.types &&
      schemaNode.types.length > 0
    ) {
      return [schemaNode.types[0], 'binary'];
    }
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

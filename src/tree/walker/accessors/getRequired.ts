function isStringOrNumber(value: unknown): boolean {
  return typeof value === 'string' || typeof value === 'number';
}

export function getRequired(required: unknown): string[] | null {
  if (!Array.isArray(required)) return null;
  return required.filter(isStringOrNumber).map(String);
}

// function getRelevantSchemaForRequireCheck(treeNode: SchemaTreeListNode): JSONSchema4 | JSONSchema4[] | null {
//   const metadata = getNodeMetadata(treeNode);
//   if (!('schemaNode' in metadata)) return null;
//   if (isArrayNodeWithItems(metadata.schemaNode)) {
//     return metadata.schemaNode.items;
//   }
//
//   return metadata.schema;
// }

import { isReferenceNode, isRegularNode, RegularNode, SchemaNodeKind } from '@stoplight/json-schema-tree';

import { isNonNullable } from '../guards/isNonNullable';
import { isComplexArray, isPrimitiveArray } from '../tree';

export function printName(schemaNode: RegularNode): string | null {
  if (
    schemaNode.primaryType !== SchemaNodeKind.Array ||
    !isNonNullable(schemaNode.children) ||
    schemaNode.children.length === 0
  ) {
    return schemaNode.title;
  }

  return printArrayName(schemaNode);
}

function printArrayName(schemaNode: RegularNode): string | null {
  if (!isNonNullable(schemaNode.children) || schemaNode.children.length === 0) {
    return schemaNode.title;
  }

  if (schemaNode.children.length === 1 && isReferenceNode(schemaNode.children[0])) {
    return `$ref(${schemaNode.children[0].value})[]`;
  }

  if (isPrimitiveArray(schemaNode)) {
    const val =
      schemaNode.children?.reduce<SchemaNodeKind[] | null>((mergedTypes, child) => {
        if (mergedTypes === null) return null;

        if (!isRegularNode(child)) return null;

        if (child.types.size > 0) {
          for (const type of child.types) {
            if (mergedTypes.includes(type)) continue;
            mergedTypes.push(type);
          }
        }

        return mergedTypes;
      }, []) ?? null;

    return val !== null && val.length > 0 ? `array of ${val.join('s/')}s` : 'array';
  }

  if (isComplexArray(schemaNode)) {
    const firstChild = schemaNode.children[0];
    if (firstChild.title) {
      return `array of ${firstChild.title}-s`;
    } else if (firstChild.primaryType) {
      return `array of ${firstChild.primaryType}s`;
    } else if (firstChild.combiners?.size) {
      return `array of ${Array.from(firstChild.combiners).join('/')}`;
    }
    return 'array';
  }

  return null;
}

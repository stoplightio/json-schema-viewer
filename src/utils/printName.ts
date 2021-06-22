import { getLastPathSegment } from '@stoplight/json';
import { isReferenceNode, isRegularNode, RegularNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import upperFirst from 'lodash/upperFirst.js';

import { isNonNullable } from '../guards/isNonNullable';
import { isComplexArray, isPrimitiveArray } from '../tree';

type PrintNameOptions = {
  shouldUseRefNameFallback?: boolean;
};

export function printName(
  schemaNode: RegularNode,
  { shouldUseRefNameFallback = false }: PrintNameOptions = {},
): string | undefined {
  if (
    schemaNode.primaryType !== SchemaNodeKind.Array ||
    !isNonNullable(schemaNode.children) ||
    schemaNode.children.length === 0
  ) {
    return schemaNode.title ?? (shouldUseRefNameFallback ? getNodeNameFromOriginalRef(schemaNode) : undefined);
  }

  return printArrayName(schemaNode, { shouldUseRefNameFallback });
}

function printArrayName(
  schemaNode: RegularNode,
  { shouldUseRefNameFallback = false }: PrintNameOptions,
): string | undefined {
  if (!isNonNullable(schemaNode.children) || schemaNode.children.length === 0) {
    return schemaNode.title ?? getNodeNameFromOriginalRef(schemaNode);
  }

  if (schemaNode.children.length === 1 && isReferenceNode(schemaNode.children[0])) {
    return `$ref(${schemaNode.children[0].value})[]`;
  }

  if (isPrimitiveArray(schemaNode)) {
    const val =
      schemaNode.children?.reduce<SchemaNodeKind[] | null>((mergedTypes, child) => {
        if (mergedTypes === null) return null;

        if (!isRegularNode(child)) return null;

        if (child.types !== null && child.types.length > 0) {
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
    } else if (shouldUseRefNameFallback && getNodeNameFromOriginalRef(schemaNode)) {
      return `array of ${getNodeNameFromOriginalRef(schemaNode)}-s`;
    } else if (firstChild.primaryType) {
      return `array of ${firstChild.primaryType}s`;
    } else if (firstChild.combiners?.length) {
      return `array of ${firstChild.combiners.join('/')}`;
    }
    return 'array';
  }

  return undefined;
}

function getNodeNameFromOriginalRef(node: RegularNode) {
  if (typeof node.originalFragment.$ref === 'string') {
    return upperFirst(getLastPathSegment(node.originalFragment.$ref));
  }
  return undefined;
}

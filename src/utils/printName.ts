import { getLastPathSegment } from '@stoplight/json';
import { isReferenceNode, isRegularNode, RegularNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import upperFirst from 'lodash/upperFirst.js';

import { isNonNullable } from '../guards/isNonNullable';
import {
  isComplexArray,
  isComplexDictionary,
  isDictionaryNode,
  isFlattenableNode,
  isPrimitiveArray,
  isPrimitiveDictionary,
} from '../tree';
import { getApplicableFormats } from './getApplicableFormats';

type PrintNameOptions = {
  shouldUseRefNameFallback?: boolean;
};

export function printName(
  schemaNode: RegularNode,
  { shouldUseRefNameFallback = false }: PrintNameOptions = {},
): string | undefined {
  if (!isFlattenableNode(schemaNode)) {
    return schemaNode.title ?? (shouldUseRefNameFallback ? getNodeNameFromOriginalRef(schemaNode) : undefined);
  }

  return printFlattenedName(schemaNode, { shouldUseRefNameFallback });
}

function printFlattenedName(
  schemaNode: RegularNode,
  { shouldUseRefNameFallback = false }: PrintNameOptions,
): string | undefined {
  if (!isNonNullable(schemaNode.children) || schemaNode.children.length === 0) {
    return schemaNode.title ?? (shouldUseRefNameFallback ? getNodeNameFromOriginalRef(schemaNode) : undefined);
  }

  if (schemaNode.children.length === 1 && isReferenceNode(schemaNode.children[0])) {
    const value = `$ref(${schemaNode.children[0].value})`;
    return isDictionaryNode(schemaNode) ? `dictionary[string, ${value}]` : `${value}[]`;
  }

  const format = isDictionaryNode(schemaNode) ? 'dictionary[string, %s]' : 'array[%s]';

  if (isPrimitiveArray(schemaNode) || isPrimitiveDictionary(schemaNode)) {
    const val =
      schemaNode.children?.reduce<(SchemaNodeKind | `${SchemaNodeKind}<${string}>`)[] | null>((mergedTypes, child) => {
        if (mergedTypes === null) return null;

        if (!isRegularNode(child)) return null;

        if (child.types !== null && child.types.length > 0) {
          const formats = getApplicableFormats(child);
          for (const type of child.types) {
            if (mergedTypes.includes(type)) continue;

            if (formats !== null && formats[0] === type) {
              mergedTypes.push(`${type}<${formats[1]}>`);
            } else {
              mergedTypes.push(type);
            }
          }
        }

        return mergedTypes;
      }, []) ?? null;

    if (val !== null && val.length > 0) {
      return format.replace('%s', val.join(' or '));
    }

    return isDictionaryNode(schemaNode) ? 'dictionary[string, any]' : 'array';
  }

  if (isComplexArray(schemaNode) || isComplexDictionary(schemaNode)) {
    const firstChild = schemaNode.children[0];
    if (firstChild.title) {
      return format.replace('%s', firstChild.title);
    } else if (shouldUseRefNameFallback && getNodeNameFromOriginalRef(schemaNode)) {
      return format.replace('%s', getNodeNameFromOriginalRef(schemaNode) ?? 'any');
    } else if (firstChild.primaryType) {
      return format.replace('%s', firstChild.primaryType);
    } else if (firstChild.combiners?.length) {
      return format.replace('%s', firstChild.combiners.join(' '));
    }
    return isComplexArray(schemaNode) ? 'array' : format.replace('%s', 'any');
  }

  return undefined;
}

function getNodeNameFromOriginalRef(node: RegularNode) {
  if (typeof node.originalFragment.$ref === 'string') {
    return upperFirst(getLastPathSegment(node.originalFragment.$ref));
  }
  return undefined;
}

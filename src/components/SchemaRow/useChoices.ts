import { extractPointerFromRef, pointerToPath } from '@stoplight/json';
import { isReferenceNode, isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import last from 'lodash/last.js';
import * as React from 'react';

import { isComplexArray, isNonEmptyParentNode } from '../../tree';
import { printName } from '../../utils';

/** one option among several mutually exclusive sub-schemas */
export type Choice = {
  title: string;
  type: SchemaNode;
};

function calculateChoiceTitle(node: SchemaNode, isPlural: boolean): string {
  const primitiveSuffix = isPlural ? 's' : '';
  if (isRegularNode(node)) {
    const realName = printName(node, { shouldUseRefNameFallback: true });
    if (realName) {
      return realName;
    }
    return node.primaryType !== null
      ? node.primaryType + primitiveSuffix
      : String(node.originalFragment.title || 'any');
  }
  if (isReferenceNode(node)) {
    if (node.value) {
      const value = extractPointerFromRef(node.value);
      const lastPiece = !node.error && value ? last(pointerToPath(value)) : null;
      if (typeof lastPiece === 'string') {
        return lastPiece.split('.')[0];
      }
    }
    return '$ref' + primitiveSuffix;
  }

  return 'any';
}

function makeChoice(node: SchemaNode): Choice {
  return {
    type: node,
    title: calculateChoiceTitle(node, false),
  };
}

function makeArrayChoice(node: SchemaNode, combiner?: string): Choice {
  const itemTitle = calculateChoiceTitle(node, true);
  const title = itemTitle !== 'any' ? `array ${combiner ? `(${combiner})` : null} [${itemTitle}]` : 'array';
  return {
    type: node,
    title,
  };
}

/**
 * Enumerates the sub-schema type for a given node.
 *
 * Usually a node has one choice, only one possible type: itself. If a node is
 * a oneOf or anyOf combiner, the possible types are the sub-types of the
 * combiner.
 */
export const useChoices = (schemaNode: SchemaNode) => {
  const choices: Choice[] = React.useMemo(() => {
    // handle flattening of arrays that contain oneOfs, same logic as below
    if (
      isComplexArray(schemaNode) &&
      isNonEmptyParentNode(schemaNode.children[0]) &&
      shouldShowChildSelector(schemaNode.children[0])
    ) {
      return schemaNode.children[0].children.map(child =>
        makeArrayChoice(child, schemaNode.children[0].combiners?.[0]),
      );
    }

    // if current node is a combiner, offer its children
    if (isNonEmptyParentNode(schemaNode) && shouldShowChildSelector(schemaNode)) {
      return schemaNode.children.map(makeChoice);
    }
    // regular node, single choice - itself
    return [makeChoice(schemaNode)];
  }, [schemaNode]);

  const defaultChoice = choices[0];

  const [selectedChoice, setSelectedChoice] = React.useState<Choice | undefined>(defaultChoice);

  React.useEffect(() => {
    setSelectedChoice(defaultChoice);
  }, [defaultChoice]);

  const actualSelectedChoice = selectedChoice && choices.includes(selectedChoice) ? selectedChoice : defaultChoice;

  return { selectedChoice: actualSelectedChoice, setSelectedChoice, choices };
};

const shouldShowChildSelector = (schemaNode: SchemaNode) =>
  isNonEmptyParentNode(schemaNode) && ['anyOf', 'oneOf'].includes(schemaNode.combiners?.[0] ?? '');

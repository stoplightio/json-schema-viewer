import { isReferenceNode, isRegularNode, SchemaNode } from '@stoplight/json-schema-tree';
import { last } from 'lodash';
import * as React from 'react';

import { isComplexArray, isParentNode } from '../../tree';
import { printName } from '../../utils';

type Choice = {
  title: string;
  type: SchemaNode;
};

function calculateChoiceTitle(node: SchemaNode, isPlural: boolean): string {
  const complexObjectSuffix = isPlural ? '-s' : '';
  const primitiveSuffix = isPlural ? 's' : '';
  if (isRegularNode(node)) {
    const realName = printName(node);
    if (realName) {
      return realName + complexObjectSuffix;
    }
    return (node.primaryType ?? 'object') + primitiveSuffix;
  }
  if (isReferenceNode(node)) {
    const lastPiece = last(node.value?.split('/') ?? []);
    if (lastPiece) {
      return lastPiece.split('.')[0] + complexObjectSuffix;
    }
    return '$ref' + primitiveSuffix;
  }

  return 'object' + primitiveSuffix;
}

function makeChoice(node: SchemaNode): Choice {
  return {
    type: node,
    title: calculateChoiceTitle(node, false),
  };
}

function makeArrayChoice(node: SchemaNode): Choice {
  return {
    type: node,
    title: `array of ${calculateChoiceTitle(node, true)}`,
  };
}

/**
 * Calculates type choices for a given node.
 *
 * Usually a node has one choice - only one possible type -, itself.
 * If a node is an oneOf or anyOf combiner, the possible types are the sub-types of the combiner.
 */
export const useChoices = (schemaNode: SchemaNode) => {
  const choices: Choice[] = React.useMemo(() => {
    // handle flattening of arrays that contain oneOfs, same logic as below
    if (
      isComplexArray(schemaNode) &&
      isParentNode(schemaNode.children[0]) &&
      shouldShowChildSelector(schemaNode.children[0])
    ) {
      return schemaNode.children[0].children.map(makeArrayChoice);
    }

    // if current node is a combiner, offer its children
    if (isParentNode(schemaNode) && shouldShowChildSelector(schemaNode)) {
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
  isParentNode(schemaNode) && ['anyOf', 'oneOf'].includes(schemaNode.combiners?.[0] ?? '');

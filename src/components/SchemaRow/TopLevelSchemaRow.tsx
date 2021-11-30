import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown.js';
import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { Box, Flex, Icon, Menu, Pressable } from '@stoplight/mosaic';
import * as React from 'react';

import { NEGATIVE_NESTING_OFFSET } from '../../consts';
import { calculateChildrenToShow, isComplexArray } from '../../tree';
import { ChildStack } from '../shared/ChildStack';
import { SchemaRow, SchemaRowProps } from './SchemaRow';
import { useChoices } from './useChoices';

export const TopLevelSchemaRow: React.FC<SchemaRowProps> = ({ schemaNode, nestingLevel }) => {
  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const childNodes = React.useMemo(() => calculateChildrenToShow(selectedChoice.type), [selectedChoice.type]);

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return (
      <DecreaseIndentation>
        <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} />
      </DecreaseIndentation>
    );
  }

  if (isRegularNode(schemaNode) && choices.length > 1) {
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;

    return (
      <DecreaseIndentation>
        <Box pos="relative">
          <Menu
            aria-label="Pick a type"
            closeOnPress
            matchTriggerWidth
            items={choices.map((choice, index) => ({
              id: index,
              title: choice.title,
              onPress: () => setSelectedChoice(choice),
            }))}
            renderTrigger={props => (
              <Pressable {...props}>
                <Flex>
                  <Flex mr={2} fontFamily="mono" fontWeight="semibold" fontSize="base" cursor="pointer" py={2}>
                    {selectedChoice.title}
                    <Box ml={1}>
                      <Icon icon={faCaretDown} />
                    </Box>
                  </Flex>
                  {combiner !== null ? (
                    <Flex alignItems="center" color="muted">
                      {combiner}
                    </Flex>
                  ) : null}
                </Flex>
              </Pressable>
            )}
          />

          {childNodes.length > 0 ? <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} /> : null}
        </Box>
      </DecreaseIndentation>
    );
  }

  if (isComplexArray(schemaNode) && isPureObjectNode(schemaNode.children[0])) {
    return (
      <DecreaseIndentation>
        <Box pos="relative">
          <Box mr={2} fontFamily="mono" fontWeight="semibold" fontSize="base" py={2}>
            array of:
          </Box>
          {childNodes.length > 0 ? <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} /> : null}
        </Box>
      </DecreaseIndentation>
    );
  }

  return <SchemaRow schemaNode={schemaNode} nestingLevel={nestingLevel} />;
};

function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1;
}

const DecreaseIndentation: React.FC = ({ children }) => <Box ml={NEGATIVE_NESTING_OFFSET}>{children}</Box>;

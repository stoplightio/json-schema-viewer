import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown.js';
import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { Box, Flex, Icon, Menu, Pressable } from '@stoplight/mosaic';
import { useUpdateAtom } from 'jotai/utils';
import * as React from 'react';

import { useOnScreen } from '../../hooks/useOnScreen';
import { calculateChildrenToShow, isComplexArray } from '../../tree';
import { showPathCrumbsAtom } from '../PathCrumbs';
import { ChildStack } from '../shared/ChildStack';
import { SchemaRow, SchemaRowProps } from './SchemaRow';
import { useChoices } from './useChoices';

export const TopLevelSchemaRow = ({ schemaNode }: Pick<SchemaRowProps, 'schemaNode'>) => {
  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const childNodes = React.useMemo(() => calculateChildrenToShow(selectedChoice.type), [selectedChoice.type]);
  const nestingLevel = 0;

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return (
      <>
        <ScrollCheck />
        <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} />
      </>
    );
  }

  if (isRegularNode(schemaNode) && choices.length > 1) {
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;

    return (
      <>
        <ScrollCheck />

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
                <Flex fontFamily="mono" fontWeight="semibold" fontSize="base" cursor="pointer" pb={4}>
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
      </>
    );
  }

  if (isComplexArray(schemaNode) && isPureObjectNode(schemaNode.children[0])) {
    return (
      <>
        <ScrollCheck />

        <Box fontFamily="mono" fontWeight="semibold" fontSize="base" pb={4}>
          array of:
        </Box>

        {childNodes.length > 0 ? <ChildStack childNodes={childNodes} currentNestingLevel={nestingLevel} /> : null}
      </>
    );
  }

  return (
    <>
      <ScrollCheck />
      <SchemaRow schemaNode={schemaNode} nestingLevel={nestingLevel} />
    </>
  );
};

function ScrollCheck() {
  const elementRef = React.useRef<HTMLDivElement>(null);

  const isOnScreen = useOnScreen(elementRef);
  const setShowPathCrumbs = useUpdateAtom(showPathCrumbsAtom);
  React.useEffect(() => {
    setShowPathCrumbs(!isOnScreen);
  }, [isOnScreen, setShowPathCrumbs]);

  return <div ref={elementRef} />;
}

function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1;
}

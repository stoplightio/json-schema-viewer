import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { Box, Flex, HStack, Icon, Menu, Pressable } from '@stoplight/mosaic';
import { useUpdateAtom } from 'jotai/utils';
import * as React from 'react';

import { COMBINER_NAME_MAP } from '../../consts';
import { useIsOnScreen } from '../../hooks/useIsOnScreen';
import { calculateChildrenToShow, isComplexArray } from '../../tree';
import { showPathCrumbsAtom } from '../PathCrumbs/state';
import { ChildStack } from '../shared/ChildStack';
import { getInternalSchemaError } from '../shared/Validations';
import { SchemaRow, SchemaRowProps } from './SchemaRow';
import { useChoices } from './useChoices';

export const TopLevelSchemaRow = ({ schemaNode }: Pick<SchemaRowProps, 'schemaNode'>) => {
  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const childNodes = React.useMemo(() => calculateChildrenToShow(selectedChoice.type), [selectedChoice.type]);
  const nestingLevel = 0;

  const internalSchemaError = getInternalSchemaError(schemaNode);

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return (
      <>
        <ScrollCheck />
        <ChildStack schemaNode={schemaNode} childNodes={childNodes} currentNestingLevel={nestingLevel} />
        {internalSchemaError.hasError && (
          <Icon title={internalSchemaError.error} color="danger" icon={['fas', 'exclamation-triangle']} size="sm" />
        )}
      </>
    );
  }

  if (isRegularNode(schemaNode) && choices.length > 1) {
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;

    return (
      <>
        <ScrollCheck />

        <HStack spacing={3} pb={4}>
          <Menu
            aria-label="Pick a type"
            closeOnPress
            placement="bottom left"
            items={choices.map((choice, index) => ({
              id: index,
              title: choice.title,
              onPress: () => setSelectedChoice(choice),
            }))}
            renderTrigger={props => (
              <Pressable {...props}>
                <Flex fontFamily="mono" fontWeight="semibold" cursor="pointer" fontSize="base">
                  {selectedChoice.title}
                  <Box ml={1}>
                    <Icon icon={['fas', 'caret-down']} />
                  </Box>
                </Flex>
              </Pressable>
            )}
          />

          {combiner !== null ? (
            <Flex alignItems="center" color="muted" fontSize="base">
              {`(${COMBINER_NAME_MAP[combiner]})`}
            </Flex>
          ) : null}
        </HStack>

        {childNodes.length > 0 ? (
          <ChildStack schemaNode={schemaNode} childNodes={childNodes} currentNestingLevel={nestingLevel} />
        ) : null}
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

        {childNodes.length > 0 ? (
          <ChildStack schemaNode={schemaNode} childNodes={childNodes} currentNestingLevel={nestingLevel} />
        ) : null}
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

  const isOnScreen = useIsOnScreen(elementRef);
  const setShowPathCrumbs = useUpdateAtom(showPathCrumbsAtom);
  React.useEffect(() => {
    setShowPathCrumbs(!isOnScreen);
  }, [isOnScreen, setShowPathCrumbs]);

  return <div ref={elementRef} />;
}

function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1;
}

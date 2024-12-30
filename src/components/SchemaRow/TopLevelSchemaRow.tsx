import { isPlainObject } from '@stoplight/json';
import { isRegularNode, RegularNode } from '@stoplight/json-schema-tree';
import { Box, Flex, HStack, Icon, Menu, Pressable } from '@stoplight/mosaic';
import { useUpdateAtom } from 'jotai/utils';
import { isEmpty } from 'lodash';
import * as React from 'react';

import { COMBINER_NAME_MAP } from '../../consts';
import { useJSVOptionsContext } from '../../contexts';
import { useIsOnScreen } from '../../hooks/useIsOnScreen';
import { isComplexArray, isDictionaryNode, visibleChildren } from '../../tree';
import { extractVendorExtensions } from '../../utils/extractVendorExtensions';
import { showPathCrumbsAtom } from '../PathCrumbs/state';
import { Description, getValidationsFromSchema, Validations } from '../shared';
import { ChildStack } from '../shared/ChildStack';
import { Error } from '../shared/Error';
import { SchemaRow, SchemaRowProps } from './SchemaRow';
import { useChoices } from './useChoices';

export const TopLevelSchemaRow = ({
  schemaNode,
  skipDescription,
}: Pick<SchemaRowProps, 'schemaNode'> & { skipDescription?: boolean }) => {
  const { renderExtensionAddon } = useJSVOptionsContext();

  const { selectedChoice, setSelectedChoice, choices } = useChoices(schemaNode);
  const childNodes = React.useMemo(() => visibleChildren(selectedChoice.type), [selectedChoice.type]);
  const nestingLevel = 0;

  const nodeId = (() => {
    if (isPlainObject(schemaNode.fragment) && isPlainObject(schemaNode.fragment['x-stoplight'])) {
      const id = schemaNode.fragment['x-stoplight'].id;
      return typeof id === 'string' ? id : undefined;
    }
    return undefined;
  })();
  const [totalVendorExtensions, vendorExtensions] = React.useMemo(
    () => extractVendorExtensions(schemaNode.fragment),
    [schemaNode.fragment],
  );
  const hasVendorProperties = totalVendorExtensions > 0;

  // regular objects are flattened at the top level
  if (isRegularNode(schemaNode) && isPureObjectNode(schemaNode)) {
    return (
      <>
        <ScrollCheck />
        {!skipDescription ? <Description value={schemaNode.annotations.description} /> : null}
        {hasVendorProperties && renderExtensionAddon
          ? renderExtensionAddon({ schemaNode, nestingLevel, vendorExtensions })
          : null}
        <ChildStack
          schemaNode={schemaNode}
          childNodes={childNodes}
          currentNestingLevel={nestingLevel}
          parentNodeId={nodeId}
        />
        <Error schemaNode={schemaNode} />
      </>
    );
  }

  if (isRegularNode(schemaNode) && choices.length > 1) {
    const combiner = isRegularNode(schemaNode) && schemaNode.combiners?.length ? schemaNode.combiners[0] : null;

    return (
      <>
        <ScrollCheck />
        {schemaNode.annotations.description !== schemaNode.parent?.fragment.description && (
          <Description value={schemaNode.annotations.description} />
        )}
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
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
          />
        ) : combiner ? (
          <SchemaRow schemaNode={selectedChoice.type} nestingLevel={nestingLevel} />
        ) : null}
      </>
    );
  }

  if (isComplexArray(schemaNode) && isPureObjectNode(schemaNode.children[0])) {
    const validations = isRegularNode(schemaNode) ? getValidationsFromSchema(schemaNode) : {};
    return (
      <>
        <ScrollCheck />
        <Description value={schemaNode.annotations.description} />

        <Box fontFamily="mono" fontWeight="semibold" fontSize="base" pb={4}>
          array of:
        </Box>

        {!isEmpty(validations) && (
          <Box fontSize="sm" mb={1} mt={-2}>
            <Validations validations={validations} />
          </Box>
        )}

        {childNodes.length > 0 ? (
          <ChildStack
            schemaNode={schemaNode}
            childNodes={childNodes}
            currentNestingLevel={nestingLevel}
            parentNodeId={nodeId}
          />
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

export function isPureObjectNode(schemaNode: RegularNode) {
  return schemaNode.primaryType === 'object' && schemaNode.types?.length === 1 && !isDictionaryNode(schemaNode);
}

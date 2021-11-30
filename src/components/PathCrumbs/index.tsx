import { isRegularNode, isRootNode, SchemaNode } from '@stoplight/json-schema-tree';
import { Box, HStack } from '@stoplight/mosaic';
import { atom, useAtom } from 'jotai';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';

export const showPathCrumbsAtom = atom<boolean>(false);

export const pathCrumbsAtom = atom<string[], SchemaNode | readonly string[]>([], (_get, set, node) => {
  set(pathCrumbsAtom, propertyPathToObjectPath(node as SchemaNode));
});

export const PathCrumbs = ({ parentCrumbs = [] }: { parentCrumbs?: string[] }) => {
  const [showPathCrumbs] = useAtom(showPathCrumbsAtom);
  const [pathCrumbs] = useAtom(pathCrumbsAtom);
  const { disableCrumbs } = useJSVOptionsContext();

  if (disableCrumbs) {
    return null;
  }

  const parentCrumbElems: React.ReactNodeArray = [];
  parentCrumbs.forEach((crumb, i) => {
    parentCrumbElems.push(<Box key={i}>{crumb}</Box>);
  });

  const pathCrumbElems: React.ReactNodeArray = [];
  pathCrumbs.forEach((crumb, i) => {
    if (pathCrumbs[i + 1]) {
      pathCrumbElems.push(<Box key={i}>{crumb}</Box>);
    } else {
      pathCrumbElems.push(
        <Box key={i} color="body" fontWeight="semibold">
          {crumb}
        </Box>,
      );
    }
  });

  // only show when have a path, and only when we've scrolled enough such that a portion of the JSV is no longer visible
  if (!showPathCrumbs || (!parentCrumbElems.length && !pathCrumbElems.length)) {
    return null;
  }

  return (
    <HStack
      spacing={1}
      divider={<Box>/</Box>}
      h="md"
      // so that the crumbs take up no space in the dom, and thus do not push content down when they appear
      mt={-8}
      borderB
      pos="sticky"
      top={0}
      fontFamily="mono"
      fontSize="sm"
      lineHeight="none"
      zIndex={10}
      bg="canvas-pure"
      px="px"
      color="light"
      alignItems="center"
    >
      {parentCrumbElems}
      {pathCrumbElems.length && <HStack divider={<Box fontWeight="bold">.</Box>}>{pathCrumbElems}</HStack>}
    </HStack>
  );
};

function propertyPathToObjectPath(node: SchemaNode) {
  const objectPath: string[] = [];

  let currentNode: SchemaNode | null = node;
  while (currentNode && !isRootNode(currentNode)) {
    if (isRegularNode(currentNode)) {
      if (currentNode.primaryType === 'array') {
        const key = `${currentNode.subpath[currentNode.subpath.length - 1]}[]`;
        if (objectPath[objectPath.length - 1]) {
          objectPath[objectPath.length - 1] = key;
        } else {
          objectPath.push(key);
        }
      } else if (currentNode.subpath.length !== 2 || !['allOf', 'oneOf', 'anyOf'].includes(currentNode.subpath[0])) {
        objectPath.push(currentNode.subpath[currentNode.subpath.length - 1]);
      }
    }

    currentNode = currentNode.parent;
  }

  return objectPath.reverse();
}

import { Box, HStack } from '@stoplight/mosaic';
import { atom, useAtom } from 'jotai';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';

export const showPathCrumbsAtom = atom<boolean>(false);

export const pathCrumbsAtom = atom<string[], readonly string[]>([], (_get, set, crumbs) => {
  set(pathCrumbsAtom, propertyPathToObjectPath(crumbs));
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

function propertyPathToObjectPath(propertyPath: readonly string[]) {
  const objectPath: string[] = [];

  let skipNext = false;
  for (const part of propertyPath) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    if (part === 'oneOf' || part === 'anyOf' || part === 'allOf') {
      skipNext = true;
    } else if (part === 'items') {
      if (objectPath[objectPath.length - 1]) {
        objectPath[objectPath.length - 1] = `${objectPath[objectPath.length - 1]}[]`;
      } else {
        objectPath.push('[]');
      }
    } else if (part !== 'properties') {
      objectPath.push(part);
    } else {
    }
  }

  return objectPath;
}

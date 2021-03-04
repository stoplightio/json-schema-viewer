import { isReferenceNode, isRegularNode, SchemaNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { Box } from '@stoplight/mosaic';
import * as React from 'react';

import { isNonNullable } from '../../guards/isNonNullable';
import { useSchemaNode } from '../../hooks';
import { calculateChildrenToShow, isParentNode } from '../../utils';
import { Types } from './Types';

export interface IProperty {
  schemaNode: SchemaNode;
}

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === 'properties' || schemaNode.subpath[0] === 'patternProperties')
  );
}

export const Property: React.FunctionComponent<IProperty> = ({ schemaNode, schemaNode: { subpath } }) => {
  const childNodes = React.useMemo(() => calculateChildrenToShow(schemaNode), [schemaNode]);

  return (
    <>
      {subpath.length > 0 && shouldShowPropertyName(schemaNode) && (
        <Box mr={2} fontFamily="mono" fontWeight="bold">
          {subpath[subpath.length - 1]}
        </Box>
      )}

      <Types />

      {childNodes.length > 0 && <Box ml={2} color="muted">{`{${childNodes.length}}`}</Box>}

      {subpath.length > 1 && subpath[0] === 'patternProperties' ? (
        <Box ml={2} textOverflow="truncate" color="muted">
          (pattern property)
        </Box>
      ) : null}
    </>
  );
};

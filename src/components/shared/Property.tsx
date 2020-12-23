import { isReferenceNode, isRegularNode, SchemaNode, SchemaNodeKind } from '@stoplight/json-schema-tree';
import { isParentNode } from '@stoplight/tree-list';
import * as React from 'react';

import { isNonNullable } from '../../guards/isNonNullable';
import { useSchemaTree, useTreeListNode } from '../../hooks';
import { useSchemaNode } from '../../hooks/useSchemaNode';
import { GoToRefHandler } from '../../types';
import { Types } from './Types';

export interface IProperty {
  onGoToRef?: GoToRefHandler;
}

function shouldShowPropertyName(schemaNode: SchemaNode) {
  return (
    schemaNode.subpath.length === 2 &&
    (schemaNode.subpath[0] === 'properties' || schemaNode.subpath[0] === 'patternProperties')
  );
}

export const Property: React.FunctionComponent<IProperty> = ({ onGoToRef }) => {
  const schemaNode = useSchemaNode();
  const treeListNode = useTreeListNode();
  const schemaTree = useSchemaTree();
  const { subpath } = schemaNode;

  const handleGoToRef = React.useCallback<React.MouseEventHandler>(() => {
    if (onGoToRef && isReferenceNode(schemaNode)) {
      onGoToRef(schemaNode);
    }
  }, [onGoToRef, schemaNode]);

  return (
    <>
      {schemaNode.subpath.length > 0 && shouldShowPropertyName(schemaNode) && (
        <div className="mr-2">{subpath[subpath.length - 1]}</div>
      )}

      <Types />

      {onGoToRef && isReferenceNode(schemaNode) && schemaNode.external ? (
        <a role="button" className="text-blue-4 ml-2" onClick={handleGoToRef}>
          (go to ref)
        </a>
      ) : null}

      {isRegularNode(schemaNode) &&
        (schemaNode.primaryType === SchemaNodeKind.Array || schemaNode.primaryType === SchemaNodeKind.Object) &&
        isParentNode(treeListNode) &&
        isNonNullable(schemaNode.children) &&
        (schemaNode.children.length !== 1 || !isReferenceNode(schemaNode.children[0])) && (
          <div className="ml-2 text-darken-7 dark:text-lighten-7">{`{${
            (schemaTree.isFlattenedNode(schemaNode) ? treeListNode.children : schemaNode.children).length
          }}`}</div>
        )}

      {subpath.length > 1 && subpath[0] === 'patternProperties' ? (
        <div className="ml-2 text-darken-7 dark:text-lighten-7 truncate">(pattern property)</div>
      ) : null}
    </>
  );
};

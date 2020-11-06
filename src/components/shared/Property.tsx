import { isLocalRef } from '@stoplight/json';
import { isParentNode } from '@stoplight/tree-list';
import * as React from 'react';
import { Types } from './Types';
import { getNodeMetadata } from '../../tree';
import { SchemaNode } from '../../tree/walker/nodes/types';
import { useSchemaNode } from '../../hooks/useSchemaNode';
import { GoToRefHandler } from '../../types';
import { ReferenceNode } from '../../tree/walker/nodes';

export interface IProperty {
  treeNode: SchemaNode;
  onGoToRef?: GoToRefHandler;
}

function shouldShowPropertyName(treeNode: SchemaTreeListNode) {
  if (treeNode.parent === null) return false;
  try {
    const { schemaNode } = getSchemaNodeMetadata(treeNode.parent);
    if (!('type' in schemaNode) || 'combiner' in schemaNode) {
      return false;
    }

    if (type === SchemaNodeKind.Array && (schemaNode as IArrayNode).items) {
      const { schemaNode: itemsSchemaNode } = getSchemaNodeMetadata(treeNode);
      return !('combiner' in itemsSchemaNode);
    }

    return type === SchemaNodeKind.Object;
  } catch {
    return false;
  }
}

function isExternalRefSchemaNode(schemaNode: SchemaNode) {
  return isRefNode(schemaNode) && schemaNode.$ref !== null && !isLocalRef(schemaNode.$ref);
}

export const Property: React.FunctionComponent<IProperty> = ({ treeNode, onGoToRef }) => {
  const schemaNode = useSchemaNode();
  const { path } = schemaNode;

  const handleGoToRef = React.useCallback<React.MouseEventHandler>(() => {
    if (onGoToRef && schemaNode instanceof ReferenceNode) {
      onGoToRef(schemaNode);
    }
  }, [onGoToRef, schemaNode]);

  return (
    <>
      {path.length > 0 && shouldShowPropertyName(treeNode) && <div className="mr-2">{path[path.length - 1]}</div>}

      <Types />

      {onGoToRef && isExternalRefSchemaNode(node) ? (
        <a role="button" className="text-blue-4 ml-2" onClick={handleGoToRef}>
          (go to ref)
        </a>
      ) : null}

      {isParentNode(treeNode) && (
        <div className="ml-2 text-darken-7 dark:text-lighten-7">{`{${treeNode.children.length}}`}</div>
      )}

      {path.length > 1 && path[path.length - 2] === 'patternProperties' ? (
        <div className="ml-2 text-darken-7 dark:text-lighten-7 truncate">(pattern property)</div>
      ) : null}
    </>
  );
};

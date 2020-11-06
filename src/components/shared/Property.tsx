import { isLocalRef } from '@stoplight/json';
import { isParentNode } from '@stoplight/tree-list';
import { Optional } from '@stoplight/types';
import * as React from 'react';
import { Types } from './Types';
import { getNodeMetadata } from '../../tree';

export interface IProperty {
  node: SchemaTreeListNode;
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



export const Property: React.FunctionComponent<IProperty> = ({ node: treeNode, onGoToRef }) => {
  const { node } = getNodeMetadata(treeNode);
  const { path } = node;

  const handleGoToRef = React.useCallback<React.MouseEventHandler>(() => {
    if (onGoToRef && '$ref' in node) {
      onGoToRef(node.$ref, node);
    }
  }, [onGoToRef, node]);

  return (
    <>
      {path.length > 0 && shouldShowPropertyName(treeNode) && <div className="mr-2">{path[path.length - 1]}</div>}

      <Types node={node} />

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

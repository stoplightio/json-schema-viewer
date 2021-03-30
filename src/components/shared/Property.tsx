import { isLocalRef } from '@stoplight/json';
import { Optional } from '@stoplight/types';
import * as React from 'react';
import { getSchemaNodeMetadata } from '../../tree/metadata';
import { GoToRefHandler, IArrayNode, SchemaKind, SchemaNode, SchemaTreeListNode } from '../../types';
import { getPrimaryType } from '../../utils/getPrimaryType';
import { hasRefItems, isArrayNodeWithItems, isCombinerNode, isRefNode } from '../../utils/guards';
import { inferType } from '../../utils/inferType';
import { SchemaTreeStoreContext } from '../JsonSchemaViewer';
import { Types } from './Types';

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

    const type = getPrimaryType(schemaNode);

    if (type === SchemaKind.Array && (schemaNode as IArrayNode).items) {
      const { schemaNode: itemsSchemaNode } = getSchemaNodeMetadata(treeNode);
      return !('combiner' in itemsSchemaNode);
    }

    return type === SchemaKind.Object;
  } catch {
    return false;
  }
}

function isExternalRefSchemaNode(schemaNode: SchemaNode) {
  return isRefNode(schemaNode) && schemaNode.$ref !== null && !isLocalRef(schemaNode.$ref);
}

function retrieve$ref(node: SchemaNode): Optional<string> {
  if (isRefNode(node) && node.$ref !== null) {
    return node.$ref;
  }

  if (hasRefItems(node) && node.items.$ref !== null) {
    return `$ref(${node.items.$ref})`;
  }

  return;
}

function getTitle(node: SchemaNode): Optional<string> {
  if (isArrayNodeWithItems(node)) {
    if (Array.isArray(node.items) || !node.items.title) {
      return retrieve$ref(node);
    }

    return node.items.title;
  }

  return node.title || retrieve$ref(node);
}

export const Property: React.FunctionComponent<IProperty> = ({ node: treeNode, onGoToRef }) => {
  const { path, schemaNode: node } = getSchemaNodeMetadata(treeNode);
  const type = isRefNode(node) ? '$ref' : isCombinerNode(node) ? node.combiner : node.type;
  const subtype = isArrayNodeWithItems(node) ? (hasRefItems(node) ? '$ref' : inferType(node.items)) : void 0;
  const title = getTitle(node);
  const treeStore = React.useContext(SchemaTreeStoreContext);

  const childrenCount = React.useMemo<number | null>(() => treeStore.tree.getChildrenCount(node), [node, treeStore]);

  const handleGoToRef = React.useCallback<React.MouseEventHandler>(() => {
    if (onGoToRef && isRefNode(node) && node.$ref !== null) {
      onGoToRef(node.$ref, node);
    }
  }, [onGoToRef, node]);

  return (
    <>
      {path.length > 0 && shouldShowPropertyName(treeNode) && <div className="mr-2">{path[path.length - 1]}</div>}

      <Types type={type} subtype={subtype} title={title} />

      {onGoToRef && isExternalRefSchemaNode(node) ? (
        <a role="button" className="text-blue-4 ml-2" onClick={handleGoToRef}>
          (go to ref)
        </a>
      ) : null}

      {childrenCount !== null && <div className="ml-2 text-darken-7 dark:text-lighten-7">{`{${childrenCount}}`}</div>}

      {path.length > 1 && path[path.length - 2] === 'patternProperties' ? (
        <div className="ml-2 text-darken-7 dark:text-lighten-7 truncate">(pattern property)</div>
      ) : null}
    </>
  );
};

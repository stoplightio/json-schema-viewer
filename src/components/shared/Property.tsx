import { isLocalRef } from '@stoplight/json';
import { Optional } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { isObject as _isObject, size as _size } from 'lodash';
import * as React from 'react';
import { getNodeMetadata } from '../../tree';
import { GoToRefHandler, IArrayNode, IObjectNode, SchemaKind, SchemaNode, SchemaTreeListNode } from '../../types';
import { getPrimaryType } from '../../utils/getPrimaryType';
import { isArrayNodeWithItems, isCombinerNode, isRefNode } from '../../utils/guards';
import { inferType } from '../../utils/inferType';
import { Types } from './Types';

export interface IProperty {
  node: SchemaTreeListNode;
  onGoToRef?: GoToRefHandler;
}

function count(obj: Optional<JSONSchema4 | null>): number | null {
  if (_isObject(obj)) {
    return _size(obj);
  }

  return null;
}

function shouldShowPropertyName(treeNode: SchemaTreeListNode) {
  if (treeNode.parent === null) return false;
  try {
    const schema = getNodeMetadata(treeNode.parent).schema;
    let type = getPrimaryType(schema);

    if (type === SchemaKind.Array && schema.items) {
      type = getPrimaryType(schema.items);
    }

    return type === SchemaKind.Object;
  } catch {
    return false;
  }
}

function isExternalRefSchemaNode(schemaNode: SchemaNode) {
  return isRefNode(schemaNode) && schemaNode.$ref !== null && !isLocalRef(schemaNode.$ref);
}

export const Property: React.FunctionComponent<IProperty> = ({ node: treeNode, onGoToRef }) => {
  const { path, schemaNode: node } = getNodeMetadata(treeNode);
  const type = isRefNode(node) ? '$ref' : isCombinerNode(node) ? node.combiner : node.type;
  const subtype = isArrayNodeWithItems(node) ? inferType(node.items) : void 0;

  const childrenCount = React.useMemo<number | null>(() => {
    if (type === SchemaKind.Object) {
      return count((node as IObjectNode).properties);
    }

    if (subtype === SchemaKind.Object) {
      return count(((node as IArrayNode).items as IObjectNode).properties);
    }

    if (subtype === SchemaKind.Array) {
      return count((node as IArrayNode).items as IArrayNode);
    }

    return null;
  }, [node]);

  const handleGoToRef = React.useCallback<React.MouseEventHandler>(() => {
    if (onGoToRef && isRefNode(node) && node.$ref !== null) {
      onGoToRef(node.$ref, node);
    }
  }, [onGoToRef, node]);

  return (
    <>
      {path.length > 0 && shouldShowPropertyName(treeNode) && <div className="mr-2">{path[path.length - 1]}</div>}

      <Types type={type} subtype={subtype}>
        {isRefNode(node) && node.$ref !== null ? `[${node.$ref}]` : null}
      </Types>

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

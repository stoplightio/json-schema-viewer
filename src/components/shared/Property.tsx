import { size as _size } from 'lodash-es';
import * as React from 'react';
import { GoToRefHandler, IArrayNode, IObjectNode, SchemaKind, SchemaNodeWithMeta } from '../../types';
import { isCombiner } from '../../utils/isCombiner';
import { isRef } from '../../utils/isRef';
import { inferType } from '../../utils/inferType';
import { Types } from './Types';

export interface IProperty {
  node: SchemaNodeWithMeta;
  onGoToRef?: GoToRefHandler;
}

export const Property: React.FunctionComponent<IProperty> = ({ node, onGoToRef }) => {
  const type = isRef(node) ? '$ref' : isCombiner(node) ? node.combiner : node.type;
  const subtype =
    type === SchemaKind.Array && (node as IArrayNode).items !== undefined
      ? inferType((node as IArrayNode).items!)
      : undefined;

  const childrenCount = React.useMemo<number | null>(
    () => {
      if (type === SchemaKind.Object) {
        return _size((node as IObjectNode).properties);
      }

      if (subtype === SchemaKind.Object) {
        return _size(((node as IArrayNode).items as IObjectNode).properties);
      }

      if (subtype === SchemaKind.Array) {
        return _size((node as IArrayNode).items as IArrayNode);
      }

      return null;
    },
    [node],
  );

  const handleGoToRef = React.useCallback<React.MouseEventHandler>(
    () => {
      if (onGoToRef) {
        onGoToRef(node.$ref!, node);
      }
    },
    [onGoToRef, node],
  );

  return (
    <>
      {node.name && <div className="mr-2">{node.name}</div>}

      <Types type={type} subtype={subtype}>
        {type === '$ref' ? `[${node.$ref}]` : null}
      </Types>

      {type === '$ref' && onGoToRef ? (
        <a role="button" className="text-blue-4 ml-2" onClick={handleGoToRef}>
          (go to ref)
        </a>
      ) : null}

      {childrenCount !== null && <div className="ml-2 text-darken-7 dark:text-lighten-7">{`{${childrenCount}}`}</div>}

      {'pattern' in node && node.pattern ? (
        <div className="ml-2 text-darken-7 dark:text-lighten-7 truncate">(pattern property)</div>
      ) : null}
    </>
  );
};

import { isReferenceNode, SchemaNode } from '@stoplight/json-schema-tree';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';
import { calculateChildrenToShow } from '../../tree';
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

  const { onGoToRef } = useJSVOptionsContext();

  return (
    <>
      {subpath.length > 0 && shouldShowPropertyName(schemaNode) && (
        <div className="sl-mr-2 sl-font-mono sl-font-bold">{subpath[subpath.length - 1]}</div>
      )}

      <Types schemaNode={schemaNode} />

      {onGoToRef && isReferenceNode(schemaNode) && schemaNode.external && onGoToRef ? (
        <a
          className="sl-ml-2 sl-cursor-pointer sl-text-primary-light"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            onGoToRef(schemaNode);
          }}
        >
          (go to ref)
        </a>
      ) : null}

      {childNodes.length > 0 && <div className="sl-ml-2 sl-text-muted">{`{${childNodes.length}}`}</div>}

      {subpath.length > 1 && subpath[0] === 'patternProperties' ? (
        <div className="sl-ml-2 sl-truncate sl-text-muted">(pattern property)</div>
      ) : null}
    </>
  );
};

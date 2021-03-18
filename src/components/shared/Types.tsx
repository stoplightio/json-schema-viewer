import {
  isReferenceNode,
  isRegularNode,
  RegularNode,
  SchemaCombinerName,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import * as React from 'react';

import { printName } from '../../utils';

function shouldRenderName(type: SchemaNodeKind | SchemaCombinerName | '$ref'): boolean {
  return type === SchemaNodeKind.Array || type === SchemaNodeKind.Object || type === '$ref';
}

function getTypes(schemaNode: RegularNode): Array<SchemaNodeKind | SchemaCombinerName> {
  return [schemaNode.types, schemaNode.combiners].reduce<Array<SchemaNodeKind | SchemaCombinerName>>(
    (values, value) => {
      if (value === null) {
        return values;
      }

      values.push(...value);
      return values;
    },
    [],
  );
}

export const Types: React.FunctionComponent<{ schemaNode: SchemaNode }> = ({ schemaNode }) => {
  if (isReferenceNode(schemaNode)) {
    return <span className="truncate">{schemaNode.value ?? '$ref'}</span>;
  }

  if (!isRegularNode(schemaNode)) {
    return null;
  }

  const types = getTypes(schemaNode);

  if (types.length === 0) return null;

  const rendered = types.map((type, i, { length }) => (
    <React.Fragment key={type}>
      <span className="sl-truncate sl-text-muted">
        {shouldRenderName(type) ? printName(schemaNode) ?? type : type}
      </span>
      {i < length - 1 && (
        <span key={`${i}-sep`} className="sl-text-muted">
          {' or '}
        </span>
      )}
    </React.Fragment>
  ));

  return rendered.length > 1 ? <div className="sl-truncate">{rendered}</div> : <>{rendered}</>;
};
Types.displayName = 'JsonSchemaViewer.Types';

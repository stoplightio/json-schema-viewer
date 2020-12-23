import {
  isReferenceNode,
  isRegularNode,
  RegularNode,
  SchemaCombinerName,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import cn from 'classnames';
import * as React from 'react';

import { PROPERTY_TYPE_COLORS } from '../../consts';
import { useSchemaNode } from '../../hooks';
import { Name } from './Name';

function shouldRenderName(type: keyof typeof PROPERTY_TYPE_COLORS): boolean {
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

export const Types: React.FunctionComponent<{}> = () => {
  const schemaNode = useSchemaNode();

  if (isReferenceNode(schemaNode)) {
    return <span className={cn(PROPERTY_TYPE_COLORS.$ref, 'truncate')}>{schemaNode.value ?? '$ref'}</span>;
  }

  if (!isRegularNode(schemaNode)) {
    return null;
  }

  const types = getTypes(schemaNode);

  if (types.length === 0) return null;

  const rendered = types.map((type, i, { length }) => (
    <React.Fragment key={type}>
      <span className={cn(PROPERTY_TYPE_COLORS[type], 'truncate')}>
        {shouldRenderName(type) ? <Name type={type} /> : type}
      </span>
      {i < length - 1 && (
        <span key={`${i}-sep`} className="text-darken-7 dark:text-lighten-6">
          {' or '}
        </span>
      )}
    </React.Fragment>
  ));

  return rendered.length > 1 ? <div className="truncate">{rendered}</div> : <>{rendered}</>;
};
Types.displayName = 'JsonSchemaViewer.Types';

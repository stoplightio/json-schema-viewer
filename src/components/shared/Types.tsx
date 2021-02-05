import {
  isReferenceNode,
  isRegularNode,
  RegularNode,
  SchemaCombinerName,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { Box, Text } from '@stoplight/mosaic';
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
    return <Text textOverflow="truncate">{schemaNode.value ?? '$ref'}</Text>;
  }

  if (!isRegularNode(schemaNode)) {
    return null;
  }

  const types = getTypes(schemaNode);

  if (types.length === 0) return null;

  const rendered = types.map((type, i, { length }) => (
    <React.Fragment key={type}>
      <Text textOverflow="truncate" color="muted">
        {shouldRenderName(type) ? <Name type={type} /> : type}
      </Text>
      {i < length - 1 && (
        <Text key={`${i}-sep`} color="muted">
          {' or '}
        </Text>
      )}
    </React.Fragment>
  ));

  return rendered.length > 1 ? <Box textOverflow="truncate">{rendered}</Box> : <>{rendered}</>;
};
Types.displayName = 'JsonSchemaViewer.Types';

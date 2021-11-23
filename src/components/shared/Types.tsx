import {
  isReferenceNode,
  isRegularNode,
  RegularNode,
  SchemaCombinerName,
  SchemaNode,
  SchemaNodeKind,
} from '@stoplight/json-schema-tree';
import { Box } from '@stoplight/mosaic';
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
    return (
      <Box as="span" textOverflow="truncate">
        {schemaNode.value ?? '$ref'}
      </Box>
    );
  }

  if (!isRegularNode(schemaNode)) {
    return null;
  }

  const types = getTypes(schemaNode);

  if (types.length === 0) return null;

  const rendered = types.map((type, i, { length }) => (
    <React.Fragment key={type}>
      <Box as="span" textOverflow="truncate" color="muted">
        {shouldRenderName(type) ? printName(schemaNode) ?? type : type}
      </Box>
      {i < length - 1 && (
        <Box as="span" key={`${i}-sep`} color="muted">
          {' or '}
        </Box>
      )}
    </React.Fragment>
  ));

  return rendered.length > 1 ? <Box textOverflow="truncate">{rendered}</Box> : <>{rendered}</>;
};
Types.displayName = 'JsonSchemaViewer.Types';

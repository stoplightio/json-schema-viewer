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

import { COMMON_JSON_SCHEMA_AND_OAS_FORMATS } from '../../consts';
import { isPrimitiveArray } from '../../tree';
import { printName } from '../../utils';
import { Format } from './Format';

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

function getFormats(schemaNode: RegularNode): Partial<Record<SchemaNodeKind, string>> {
  const formats: Partial<Record<SchemaNodeKind, string>> = {};

  if (isPrimitiveArray(schemaNode) && schemaNode.children[0].format !== null) {
    formats.array = schemaNode.children[0].format;
  }

  if (schemaNode.format === null) {
    return formats;
  }

  const types = getTypes(schemaNode);

  for (const type of types) {
    if (!(type in COMMON_JSON_SCHEMA_AND_OAS_FORMATS)) continue;

    if (COMMON_JSON_SCHEMA_AND_OAS_FORMATS[type].includes(schemaNode.format)) {
      formats[type] = schemaNode.format;
      return formats;
    }
  }

  formats.string = schemaNode.format;
  return formats;
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
  const formats = getFormats(schemaNode);

  if (types.length === 0) {
    return formats.string !== void 0 ? <Format format={formats.string} /> : null;
  }

  const rendered = types.map((type, i, { length }) => (
    <React.Fragment key={type}>
      <Box as="span" textOverflow="truncate" color="muted">
        {shouldRenderName(type) ? printName(schemaNode) ?? type : type}
      </Box>

      {type in formats ? <Format format={formats[type]} /> : null}

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

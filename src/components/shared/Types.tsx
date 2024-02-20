import {
  isBooleanishNode,
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
import { getApplicableFormats } from '../../utils/getApplicableFormats';

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
      <Box as="span" textOverflow="truncate" data-test="property-type-ref">
        {schemaNode.value ?? '$ref'}
      </Box>
    );
  }

  if (isBooleanishNode(schemaNode)) {
    return (
      <Box as="span" textOverflow="truncate" color="muted" data-test="property-type">
        {schemaNode.fragment ? 'any' : 'never'}
      </Box>
    );
  }

  if (!isRegularNode(schemaNode)) {
    return null;
  }

  const formats = getApplicableFormats(schemaNode);
  const types = getTypes(schemaNode);

  if (types.length === 0) {
    return (
      <Box as="span" textOverflow="truncate" color="muted" data-test="property-type">
        {formats === null ? 'any' : `<${formats[1]}>`}
      </Box>
    );
  }

  const rendered = types.map((type, i, { length }) => {
    let printedName;
    if (shouldRenderName(type)) {
      printedName = printName(schemaNode);
    }

    printedName ??= type + (formats === null || formats[0] !== type ? '' : `<${formats[1]}>`);

    return (
      <React.Fragment key={type}>
        <Box as="span" textOverflow="truncate" color="muted" data-test="property-type">
          {printedName}
        </Box>

        {i < length - 1 && (
          <Box as="span" key={`${i}-sep`} color="muted">
            {' or '}
          </Box>
        )}
      </React.Fragment>
    );
  });

  return rendered.length > 1 ? <Box textOverflow="truncate">{rendered}</Box> : <>{rendered}</>;
};
Types.displayName = 'JsonSchemaViewer.Types';

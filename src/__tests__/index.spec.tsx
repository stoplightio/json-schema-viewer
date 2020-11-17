import * as fs from 'fs';
import { JSONSchema4 } from 'json-schema';
import * as path from 'path';
import * as React from 'react';
import { JsonSchemaViewer } from '../components';
import { dumpDom } from './utils/dumpDom';

describe('HTML Output', () => {
  test.each([
    'ref/original.json',
    'array-of-allofs.json',
    'array-of-objects.json',
    'array-of-refs.json',
    'combiner-schema.json',
    'complex-allOf-model.json',
    'default-schema.json',
    'formats-schema.json',
    'nullish-ref.schema.json',
    'todo-allof.schema.json',
    'tickets.schema.json',
  ])('should match %s', filename => {
    const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../__fixtures__/', filename), 'utf8'));

    expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf />)).toMatchSnapshot();
  });

  describe.each(['anyOf', 'oneOf'])('given %s combiner placed next to allOf', combiner => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: 'object',
        title: 'Account',
        allOf: [
          {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['admin', 'editor'],
              },
              enabled: {
                type: 'boolean',
                description: 'Is this account enabled',
              },
            },
            required: ['type'],
          },
        ],
        [combiner]: [
          {
            type: 'object',
            title: 'Admin',
            properties: {
              root: {
                type: 'boolean',
              },
              group: {
                type: 'string',
              },
              expirationDate: {
                type: 'string',
              },
            },
          },
          {
            type: 'object',
            title: 'Editor',
            properties: {
              supervisor: {
                type: 'string',
              },
              key: {
                type: 'string',
              },
            },
          },
        ],
      };
    });

    test('given allOf merging disabled, should preserve both combiners', () => {
      expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf={false} />)).toMatchSnapshot();
    });

    test('given allOf merging enabled, should merge contents of allOf combiners', () => {
      expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf />)).toMatchSnapshot();
    });
  });

  test.each(['standalone', 'read', 'write'])('given %s mode, should populate proper nodes', mode => {
    const schema: JSONSchema4 = {
      type: ['string', 'object'],
      properties: {
        id: {
          type: 'string',
          readOnly: true,
        },
        description: {
          type: 'string',
          writeOnly: true,
        },
      },
    };

    expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf />)).toMatchSnapshot();
  });

  test('given multiple object and string type, should process properties', () => {
    const schema: JSONSchema4 = {
      type: ['string', 'object'],
      properties: {
        ids: {
          type: 'array',
          items: {
            type: 'integer',
          },
        },
      },
    };

    expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf />)).toMatchSnapshot();
  });

  test('given complex type that includes array and complex array subtype, should not ignore subtype', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      properties: {
        items: {
          type: ['null', 'array'],
          items: {
            type: ['string', 'number'],
          },
          description:
            "This description can be long and should truncate once it reaches the end of the row. If it's not truncating then theres and issue that needs to be fixed. Help!",
        },
      },
    };

    expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf />)).toMatchSnapshot();
  });

  test('given visible $ref node, should try to inject the title immediately', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      properties: {
        foo: {
          $ref: '#/properties/user',
        },
        user: {
          title: 'User',
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      },
    };

    expect(dumpDom(<JsonSchemaViewer schema={schema} />)).toMatchSnapshot();
  });
});

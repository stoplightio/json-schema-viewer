import 'jest-enzyme';

import * as fastGlob from 'fast-glob';
import * as fs from 'fs';
import { JSONSchema4 } from 'json-schema';
import * as path from 'path';
import * as React from 'react';

import { JsonSchemaViewer } from '../components';
import { ViewMode } from '../types';
import { dumpDom } from './utils/dumpDom';

describe('HTML Output', () => {
  it.each(
    fastGlob.sync('**/*.json', {
      cwd: path.join(__dirname, '../__fixtures__'),
      ignore: ['stress-schema.json'],
    }),
  )('should match %s', filename => {
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

    it('given allOf merging disabled, should still merge', () => {
      expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf={false} />)).toMatchSnapshot();
    });

    it('given allOf merging enabled, should merge contents of allOf combiners', () => {
      expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf />)).toMatchSnapshot();
    });
  });

  it('given array with oneOf containing items, should merge it correctly', () => {
    const schema: JSONSchema4 = {
      oneOf: [
        {
          items: {
            type: 'string',
          },
        },
        {
          items: {
            type: 'number',
          },
        },
      ],
      type: 'array',
    };

    expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} />)).toMatchSnapshot();
  });

  it.each<ViewMode>(['standalone', 'read', 'write'])('given %s mode, should populate proper nodes', mode => {
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

    expect(dumpDom(<JsonSchemaViewer schema={schema} expanded={true} mergeAllOf viewMode={mode} />)).toMatchSnapshot();
  });

  it('given multiple object and string type, should process properties', () => {
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

  it('given complex type that includes array and complex array subtype, should not ignore subtype', () => {
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

  it('given visible $ref node, should try to inject the title immediately', () => {
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

describe('$ref resolving', () => {
  it('should render caret for schema with top-level $ref pointing at complex type', () => {
    const schema: JSONSchema4 = {
      $ref: '#/definitions/foo',
      definitions: {
        foo: {
          type: 'string',
        },
      },
    };

    expect(dumpDom(<JsonSchemaViewer schema={schema} />)).toMatchInlineSnapshot(`
      "<div>
        <div>
          <div>
            <div style=\\"margin-left: 0px\\">
              <span class=\\"hover:bg-darken-3\\" role=\\"button\\" style=\\"width: 20px; height: 20px; position: relative\\">
                <span icon=\\"caret-right\\"></span>
              </span>
              <div><span class=\\"text-purple-6 dark:text-purple-4\\">#/definitions/foo</span></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      "
    `);
  });

  it('should render caret for top-level array with $ref items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: {
        $ref: '#/foo',
      },
    };

    expect(dumpDom(<JsonSchemaViewer schema={schema} />)).toMatchInlineSnapshot(`
      "<div>
        <div>
          <div>
            <div style=\\"margin-left: 0px\\">
              <span class=\\"hover:bg-darken-3\\" role=\\"button\\" style=\\"width: 20px; height: 20px; position: relative\\">
                <span icon=\\"caret-right\\"></span>
              </span>
              <div><span class=\\"text-green-6 dark:text-green-4\\">$ref(#/foo)[]</span></div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      "
    `);
  });
});

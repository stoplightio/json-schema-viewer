import 'jest-enzyme';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as fastGlob from 'fast-glob';
import * as fs from 'fs';
import { JSONSchema4 } from 'json-schema';
import { curry } from 'lodash';
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

    expect(dumpDom(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />)).toMatchSnapshot();
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

    it('given allOf merging enabled, should merge contents of allOf combiners', () => {
      expect(dumpDom(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />)).toMatchSnapshot();
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

    render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />);

    expect(screen.queryByText('array[string]')).toBeInTheDocument();
    expect(screen.queryByText('array[number]')).toBeInTheDocument();
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

    render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} viewMode={mode} />);

    const idElement = screen.queryByText('id');
    const descriptionElement = screen.queryByText('description');
    if (mode !== 'read') {
      expect(descriptionElement).toBeInTheDocument();
    }
    if (mode !== 'write') {
      expect(idElement).toBeInTheDocument();
    }
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

    render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />);

    expect(screen.queryByText('ids')).toBeInTheDocument();
  });

  it('given complex type that includes array and complex array subtype, should not ignore subtype', () => {
    const description =
      "This description can be long and should truncate once it reaches the end of the row. If it's not truncating then theres and issue that needs to be fixed. Help!";
    const schema: JSONSchema4 = {
      type: 'object',
      properties: {
        items: {
          type: ['null', 'array'],
          items: {
            type: ['string', 'number'],
          },
          description: description,
        },
      },
    };

    render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />);

    expect(screen.queryByText('array[string,number]')).toBeInTheDocument();
    expect(screen.queryByText(description)).toBeInTheDocument();
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

    render(<JsonSchemaViewer schema={schema} />);

    expect(screen.queryAllByText('User')).toHaveLength(2); // one for user, one for foo
  });
});

describe.each([{}, { unknown: '' }, { $ref: null }])('given empty schema, should render empty text', schema => {
  const { container } = render(<JsonSchemaViewer schema={schema as any} />);
  expect(container).toHaveTextContent('No schema defined');
});

describe('Expanded depth', () => {
  /**
   * Makes sure that exactly the first `desiredVisibleElementCount` elements from `hierarchy` are visible on the screen.
   */
  const assertTreeFragmentVisible = curry((hierarchy: readonly string[], desiredVisibleElementCount: number) => {
    for (const hierarchyElement of hierarchy.slice(0, desiredVisibleElementCount)) {
      expect(screen.getByText(hierarchyElement)).toBeInTheDocument();
    }
    if (hierarchy.length > desiredVisibleElementCount) {
      expect(screen.queryByText(hierarchy[desiredVisibleElementCount])).not.toBeInTheDocument();
    }
  });

  /**
   * Expands the tree, starting with the `expandRangeStart` element (first one clicked)
   * and stopping at the `expandRangeEnd` (not clicked).
   *
   * Finally ensures that the desired portion of the tree is visible.
   */
  const expandAndAssertTreeFragmentVisible = curry(
    (hierarchy: readonly string[], expandRangeStart: number, expandRangeEnd: number) => {
      for (const hierarchyElement of hierarchy.slice(expandRangeStart, expandRangeEnd)) {
        const element = screen.getByText(hierarchyElement);

        userEvent.click(element!);
      }

      assertTreeFragmentVisible(hierarchy, expandRangeEnd + 1);
    },
  );

  const mergedArrayWithObjectSchema = {
    type: 'array',
    items: {
      type: 'object',
      title: 'outer',
      properties: {
        foo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bar: {
                type: 'object',
                properties: {
                  baz: {
                    type: 'integer',
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const mergedArrayWithObjectNo2Schema = {
    type: 'array',
    items: {
      type: 'object',
      title: 'outer',
      properties: {
        bar: {
          type: 'integer',
        },
        foo: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              bar2: {
                type: 'string',
              },
              foo2: {
                type: 'number',
              },
            },
          },
        },
      },
    },
  };

  const nestedObjectSchema = {
    type: 'object',
    title: 'root',
    properties: {
      bar: {
        type: 'object',
        properties: {
          barFoo: {
            type: 'object',
            properties: {
              barFooBar: {
                type: 'object',
              },
            },
          },
          barBar: {
            type: 'string',
          },
          barBaz: {
            type: 'boolean',
          },
        },
      },
      foo: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            fooBar: {
              type: 'string',
            },
            fooFoo: {
              type: 'number',
            },
          },
        },
      },
    },
  };

  describe.each([
    ['merged array with object', mergedArrayWithObjectSchema, ['outer[]', 'foo', 'bar', 'baz']],
    ['merged array with object #2', mergedArrayWithObjectNo2Schema, ['outer[]', 'foo', 'bar2']],
    ['nested object', nestedObjectSchema, ['root', 'bar', 'barFoo', 'barFooBar']],
  ])('%s', (title, schema, hierarchy) => {
    const assertVisibleCount = assertTreeFragmentVisible(hierarchy);
    const tryExpandAndAssert = expandAndAssertTreeFragmentVisible(hierarchy);

    describe('static', () => {
      it.each([-1, 0, 1])('defaultExpandedDepth={%i}', level => {
        render(<JsonSchemaViewer schema={schema as JSONSchema4} defaultExpandedDepth={level} />);

        assertVisibleCount(level + 2);
      });
    });

    describe('actual expanding', () => {
      it.each([-1, 0, 1])('starting from defaultExpandedDepth={%i}, should expand successfully', level => {
        render(<JsonSchemaViewer schema={schema as JSONSchema4} defaultExpandedDepth={level} />);

        tryExpandAndAssert(level + 1, hierarchy.length - 1);
      });
    });
  });
});

describe('$ref resolving', () => {
  it('should render type for schema with top-level $ref pointing at primitive type', () => {
    const schema: JSONSchema4 = {
      $ref: '#/definitions/foo',
      definitions: {
        foo: {
          type: 'string',
        },
      },
    };

    render(<JsonSchemaViewer schema={schema} />);

    expect(screen.getByText('string')).toBeInTheDocument();
  });

  it('should render caret for top-level array with $ref items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: {
        $ref: '#/foo',
      },
    };

    render(<JsonSchemaViewer schema={schema} />);

    expect(screen.getByText('$ref(#/foo)[]')).toBeInTheDocument();
  });
});

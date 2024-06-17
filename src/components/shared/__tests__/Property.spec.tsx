import '@testing-library/jest-dom';

import { Provider as MosaicProvider } from '@stoplight/mosaic';
import { render } from '@testing-library/react';
import type { JSONSchema4, JSONSchema7 } from 'json-schema';
import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { SchemaRow } from '../..';
import { buildTree, findNodeWithPath } from './utils';

describe('Property component', () => {
  function renderSchema(schema: JSONSchema4 | JSONSchema7, nodePath?: readonly string[]) {
    const tree = buildTree(schema);

    const node = nodePath ? findNodeWithPath(tree, nodePath) : tree.children[0];

    if (node === undefined) {
      throw new Error('Schema node not found in tree');
    }
    const wrapper = render(
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>,
    );

    return wrapper;
  }

  it('should render Types with proper type and subtype', () => {
    let schema: JSONSchema4 = {
      type: 'array',
      items: {
        type: 'string',
      },
    };

    let wrapper = renderSchema(schema).queryAllByTestId('property-type')[0];
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="sl-truncate sl-text-muted"
        data-test="property-type"
      >
        array[string]
      </span>
    `,
    );

    schema = {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    };

    wrapper = renderSchema(schema).queryAllByTestId('property-type')[0];
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="sl-truncate sl-text-muted"
        data-test="property-type"
      >
        array[string]
      </span>
    `,
    );
  });

  it('should handle nullish items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: null as any,
    };

    const wrapper = renderSchema(schema).queryByTestId('property-type');
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="sl-truncate sl-text-muted"
        data-test="property-type"
      >
        array
      </span>
    `,
    );
  });

  it('should handle nullish $ref', () => {
    const schema: JSONSchema4 = {
      $ref: null as any,
    };

    const wrapper = renderSchema(schema).queryByTestId('property-type-ref');
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="sl-truncate"
        data-test="property-type-ref"
      >
        $ref
      </span>
    `,
    );
  });

  it('should display true schemas', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        foo: true,
      },
    };

    const wrapper = renderSchema(schema, ['properties', 'foo']).queryByTestId('property-type');
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="sl-truncate sl-text-muted"
        data-test="property-type"
      >
        any
      </span>
    `,
    );
  });

  it('should display false schemas', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        foo: false,
      },
    };

    const wrapper = renderSchema(schema, ['properties', 'foo']).queryByTestId('property-type');
    expect(wrapper).toMatchInlineSnapshot(
      `
      <span
        class="sl-truncate sl-text-muted"
        data-test="property-type"
      >
        never
      </span>
    `,
    );
  });

  describe('properties names', () => {
    it('given an object, should display the names of its properties', () => {
      const schema: JSONSchema4 = {
        properties: {
          foo: {
            type: 'string',
          },
        },
      };

      const wrapper = renderSchema(schema, ['properties', 'foo']).queryByTestId('schema-row');
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class="sl-flex sl-relative sl-max-w-full sl-py-2"
          data-id="862ab7c3a6663"
          data-test="schema-row"
        >
          <div
            class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
          >
            <div
              class="sl-flex sl-items-center sl-max-w-full"
            >
              <div
                class="sl-flex sl-items-baseline sl-text-base"
              >
                <div
                  class="sl-font-mono sl-font-semibold sl-mr-2"
                  data-test="property-name-foo"
                >
                  foo
                </div>
                <span
                  class="sl-truncate sl-text-muted"
                  data-test="property-type"
                >
                  string
                </span>
              </div>
            </div>
          </div>
        </div>
      `,
      );
    });

    it('given an object among other types, should still display its properties', () => {
      const schema: JSONSchema4 = {
        type: ['string', 'object'],
        properties: {
          foo: {
            type: 'array',
            items: {
              type: 'integer',
            },
          },
        },
      };

      const wrapper = renderSchema(schema, ['properties', 'foo']).queryByTestId('schema-row');
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class="sl-flex sl-relative sl-max-w-full sl-py-2"
          data-id="862ab7c3a6663"
          data-test="schema-row"
        >
          <div
            class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
          >
            <div
              class="sl-flex sl-items-center sl-max-w-full"
            >
              <div
                class="sl-flex sl-items-baseline sl-text-base"
              >
                <div
                  class="sl-font-mono sl-font-semibold sl-mr-2"
                  data-test="property-name-foo"
                >
                  foo
                </div>
                <span
                  class="sl-truncate sl-text-muted"
                  data-test="property-type"
                >
                  array[integer]
                </span>
              </div>
            </div>
          </div>
        </div>
      `,
      );
    });

    it('given an array of objects, should display names of those properties', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        items: {
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
      };

      const wrapper = renderSchema(schema, ['items', 'properties', 'foo']).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class=""
          id="mosaic-provider-react-aria-0-1"
        >
          <div
            class=""
            data-overlay-container="true"
          >
            <div
              class="sl-flex sl-relative sl-max-w-full sl-py-2"
              data-id="862ab7c3a6663"
              data-test="schema-row"
            >
              <div
                class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
              >
                <div
                  class="sl-flex sl-items-center sl-max-w-full"
                >
                  <div
                    class="sl-flex sl-items-baseline sl-text-base"
                  >
                    <div
                      class="sl-font-mono sl-font-semibold sl-mr-2"
                      data-test="property-name-foo"
                    >
                      foo
                    </div>
                    <span
                      class="sl-truncate sl-text-muted"
                      data-test="property-type"
                    >
                      string
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      );
    });

    it('given an array with a combiner inside, should merge it', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        items: {
          oneOf: [
            {
              type: 'string',
            },
            {
              type: 'number',
            },
          ],
        },
      };

      const wrapper = renderSchema(schema).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class=""
          id="mosaic-provider-react-aria-0-1"
        >
          <div
            class=""
            data-overlay-container="true"
          >
            <div
              class="sl-flex sl-relative sl-max-w-full sl-py-2"
              data-id="bf8b96e78f11d"
              data-test="schema-row"
            >
              <div
                class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
              >
                <div
                  class="sl-flex sl-items-center sl-max-w-full"
                >
                  <div
                    class="sl-flex sl-items-baseline sl-text-base"
                  >
                    <div
                      class="sl-select sl-relative"
                    >
                      <div
                        aria-hidden="true"
                        style="border: 0px; clip-path: inset(50%); height: 1px; margin: 0px -1px -1px 0px; overflow: hidden; padding: 0px; position: absolute; width: 1px; white-space: nowrap;"
                      >
                        <input
                          style="font-size: 16px;"
                          tabindex="-1"
                          type="text"
                        />
                        <label>
                          <select
                            size="2"
                            tabindex="-1"
                          >
                            <option />
                            <option
                              value="0"
                            >
                              array (oneOf) [strings]
                            </option>
                            <option
                              value="1"
                            >
                              array (oneOf) [numbers]
                            </option>
                          </select>
                        </label>
                      </div>
                      <div
                        class="sl-relative"
                      >
                        <button
                          aria-expanded="false"
                          aria-haspopup="listbox"
                          aria-label="Pick a type"
                          aria-labelledby="react-aria-0-4 react-aria-0-6"
                          class="sl-button sl-form-group-border sl-w-full sl-h-sm sl-text-base sl-font-normal sl-px-1.5 sl-bg-transparent sl-rounded sl-border-transparent hover:sl-border-input focus:sl-border-primary active:sl-border-primary sl-border disabled:sl-opacity-60"
                          id="react-aria-0-4"
                          type="button"
                        >
                          <div
                            class="sl-flex sl-flex-1 sl-justify-items-start sl-items-center"
                          >
                            <div
                              class="sl-pr-1"
                            >
                              array (oneOf) [strings]
                            </div>
                          </div>
                          <div
                            class="sl-text-xs sl--mr-0.5 sl-ml-1"
                          >
                            <div
                              class="sl-pt-0.5 sl-pr-0.5"
                            >
                              <svg
                                aria-hidden="true"
                                class="svg-inline--fa fa-chevron-down fa-xs sl-icon"
                                data-icon="chevron-down"
                                data-prefix="fas"
                                focusable="false"
                                role="img"
                                viewBox="0 0 448 512"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"
                                  fill="currentColor"
                                />
                              </svg>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      );
    });

    it('given an array with a mergeable combiner inside, should merge it', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        items: {
          oneOf: [
            {
              properties: {
                foo: {},
                bar: {},
                baz: {},
              },
            },
          ],
          type: 'object',
        },
      };

      const wrapper = renderSchema(schema).container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class=""
          id="mosaic-provider-react-aria-0-1"
        >
          <div
            class=""
            data-overlay-container="true"
          >
            <div
              class="sl-flex sl-relative sl-max-w-full sl-py-2"
              data-id="bf8b96e78f11d"
              data-test="schema-row"
            >
              <div
                class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
              >
                <div
                  class="sl-flex sl-items-center sl-max-w-full sl-cursor-pointer"
                >
                  <div
                    class="sl-flex sl-justify-center sl-w-8 sl--ml-8 sl-pl-3 sl-text-muted"
                    role="button"
                  >
                    <svg
                      aria-hidden="true"
                      class="svg-inline--fa fa-chevron-down fa-fw fa-sm sl-icon"
                      data-icon="chevron-down"
                      data-prefix="fas"
                      focusable="false"
                      role="img"
                      viewBox="0 0 448 512"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div
                    class="sl-flex sl-items-baseline sl-text-base"
                  >
                    <span
                      class="sl-truncate sl-text-muted"
                      data-test="property-type"
                    >
                      array[object]
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="sl-text-sm"
              data-level="0"
            >
              <div
                class="sl-flex sl-relative sl-max-w-full sl-py-2"
                data-id="85705cc624c84"
                data-test="schema-row"
              >
                <div
                  class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
                >
                  <div
                    class="sl-flex sl-items-center sl-max-w-full"
                  >
                    <div
                      class="sl-flex sl-items-baseline sl-text-base"
                    >
                      <div
                        class="sl-font-mono sl-font-semibold sl-mr-2"
                        data-test="property-name-foo"
                      >
                        foo
                      </div>
                      <span
                        class="sl-truncate sl-text-muted"
                        data-test="property-type"
                      >
                        any
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="sl-flex sl-relative sl-max-w-full sl-py-2"
                data-id="8ce05b74b485f"
                data-test="schema-row"
              >
                <div
                  class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
                >
                  <div
                    class="sl-flex sl-items-center sl-max-w-full"
                  >
                    <div
                      class="sl-flex sl-items-baseline sl-text-base"
                    >
                      <div
                        class="sl-font-mono sl-font-semibold sl-mr-2"
                        data-test="property-name-bar"
                      >
                        bar
                      </div>
                      <span
                        class="sl-truncate sl-text-muted"
                        data-test="property-type"
                      >
                        any
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div
                class="sl-flex sl-relative sl-max-w-full sl-py-2"
                data-id="8c605b74b3bb7"
                data-test="schema-row"
              >
                <div
                  class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
                >
                  <div
                    class="sl-flex sl-items-center sl-max-w-full"
                  >
                    <div
                      class="sl-flex sl-items-baseline sl-text-base"
                    >
                      <div
                        class="sl-font-mono sl-font-semibold sl-mr-2"
                        data-test="property-name-baz"
                      >
                        baz
                      </div>
                      <span
                        class="sl-truncate sl-text-muted"
                        data-test="property-type"
                      >
                        any
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      );
    });

    it('given an array with an allOf inside and enabled allOf merging, should display the name of properties', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {
          'array-all-objects': {
            type: 'array',
            items: {
              allOf: [
                {
                  properties: {
                    foo: {
                      type: 'string',
                    },
                  },
                },
                {
                  properties: {
                    bar: {
                      type: 'string',
                    },
                  },
                },
              ],
              type: 'object',
            },
          },
        },
      };

      let wrapper = renderSchema(schema, ['properties', 'array-all-objects', 'items', 'properties', 'foo']).container
        .firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class=""
          id="mosaic-provider-react-aria-0-1"
        >
          <div
            class=""
            data-overlay-container="true"
          >
            <div
              class="sl-flex sl-relative sl-max-w-full sl-py-2"
              data-id="862ab7c3a6663"
              data-test="schema-row"
            >
              <div
                class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
              >
                <div
                  class="sl-flex sl-items-center sl-max-w-full"
                >
                  <div
                    class="sl-flex sl-items-baseline sl-text-base"
                  >
                    <div
                      class="sl-font-mono sl-font-semibold sl-mr-2"
                      data-test="property-name-foo"
                    >
                      foo
                    </div>
                    <span
                      class="sl-truncate sl-text-muted"
                      data-test="property-type"
                    >
                      string
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      );

      wrapper = renderSchema(schema, ['properties', 'array-all-objects', 'items', 'properties', 'bar']).container
        .firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class=""
          id="mosaic-provider-react-aria-0-1"
        >
          <div
            class=""
            data-overlay-container="true"
          >
            <div
              class="sl-flex sl-relative sl-max-w-full sl-py-2"
              data-id="3cbab69efa81f"
              data-test="schema-row"
            >
              <div
                class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
              >
                <div
                  class="sl-flex sl-items-center sl-max-w-full"
                >
                  <div
                    class="sl-flex sl-items-baseline sl-text-base"
                  >
                    <div
                      class="sl-font-mono sl-font-semibold sl-mr-2"
                      data-test="property-name-bar"
                    >
                      bar
                    </div>
                    <span
                      class="sl-truncate sl-text-muted"
                      data-test="property-type"
                    >
                      string
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      );
    });

    it('given a ref pointing at complex type, should display property name', () => {
      const schema: JSONSchema4 = {
        properties: {
          foo: {
            $ref: '#/properties/bar',
          },
          bar: {
            type: 'object',
          },
        },
      };

      const tree = buildTree(schema);

      const wrapper = render(<SchemaRow schemaNode={findNodeWithPath(tree, ['properties', 'foo'])!} nestingLevel={0} />)
        .container.firstChild;
      expect(wrapper).toMatchInlineSnapshot(
        `
        <div
          class="sl-flex sl-relative sl-max-w-full sl-py-2"
          data-id="862ab7c3a6663"
          data-test="schema-row"
        >
          <div
            class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full"
          >
            <div
              class="sl-flex sl-items-center sl-max-w-full"
            >
              <div
                class="sl-flex sl-items-baseline sl-text-base"
              >
                <div
                  class="sl-font-mono sl-font-semibold sl-mr-2"
                  data-test="property-name-foo"
                >
                  foo
                </div>
                <span
                  class="sl-truncate sl-text-muted"
                  data-test="property-type"
                >
                  object
                </span>
              </div>
            </div>
          </div>
        </div>
      `,
      );
    });
  });

  describe('properties titles', () => {
    it('given object type, should render title', () => {
      const schema: JSONSchema4 = {
        title: 'User',
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
        },
      };

      const wrapper = renderSchema(schema).queryAllByTestId('property-type')[0];
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="sl-truncate sl-text-muted"
          data-test="property-type"
        >
          User
        </span>
      `,
      );
    });

    it('given array type with non-array items, should render title', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        items: {
          title: 'User',
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
          },
        },
      };

      const wrapper = renderSchema(schema).queryAllByTestId('property-type')[0];
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="sl-truncate sl-text-muted"
          data-test="property-type"
        >
          array[User]
        </span>
      `,
      );
    });

    it('given array with no items, should render title', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        title: 'User',
      };

      const wrapper = renderSchema(schema).queryByTestId('property-type');
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="sl-truncate sl-text-muted"
          data-test="property-type"
        >
          User
        </span>
      `,
      );
    });

    it('given array with defined items, should not render title', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        items: [
          {
            title: 'foo',
            type: 'string',
          },
          {
            title: 'bar',
            type: 'number',
          },
        ],
      };

      const wrapper = renderSchema(schema).queryAllByTestId('property-type')[0];
      expect(wrapper).toMatchInlineSnapshot(
        `
        <span
          class="sl-truncate sl-text-muted"
          data-test="property-type"
        >
          array
        </span>
      `,
      );
    });
  });

  describe('format', () => {
    const schema: JSONSchema4 = require('../../../__fixtures__/formats-schema.json');

    it('should render next to a single type', () => {
      const wrapper = renderSchema(schema, ['properties', 'id']).queryByText('number<float>');
      expect(wrapper).toBeInTheDocument();
    });

    it.each`
      property               | text
      ${'count'}             | ${'integer<int32> or null'}
      ${'date-of-birth'}     | ${'number or string<date-time> or array'}
      ${'array-of-integers'} | ${'array[integer<int32>]'}
      ${'map-of-ids'}        | ${'dictionary[string, integer<int32>]'}
      ${'size'}              | ${'number<byte> or string'}
    `('given $property property, should render next to the appropriate type $text', ({ property }) => {
      const wrapper = renderSchema(schema, ['properties', property]).container.firstChild;
      expect(wrapper).toMatchSnapshot();
    });

    it('should render even when the type(s) is/are missing', () => {
      const wrapper = renderSchema(schema, ['properties', 'notype']).queryByText('<date-time>');
      expect(wrapper).toBeInTheDocument();
    });
  });
});

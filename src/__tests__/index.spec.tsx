import '@testing-library/jest-dom';

import { render } from '@testing-library/react';
import { JSONSchema4, JSONSchema7 } from 'json-schema';
import * as React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { JsonSchemaViewer } from '../components';
import { ViewMode } from '../types';

describe('HTML Output', () => {
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
      expect(
        render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container.firstChild,
      ).toMatchSnapshot();
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

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container.firstChild,
    ).toMatchSnapshot();
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

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} viewMode={mode} />).container.firstChild,
    ).toMatchSnapshot();
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

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container.firstChild,
    ).toMatchSnapshot();
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

    expect(
      render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container.firstChild,
    ).toMatchSnapshot();
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

    expect(render(<JsonSchemaViewer schema={schema} />).container.firstChild).toMatchSnapshot();
  });

  it('given dictionary with defined properties, should not render them', () => {
    const schema: JSONSchema7 = {
      type: ['object', 'null'],
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
      additionalProperties: {
        type: 'string',
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container.firstChild)
      .toMatchInlineSnapshot(`
      <div
        class=""
        id="mosaic-provider-react-aria-0-1"
      >
        <div
          class=""
          data-overlay-container="true"
        >
          <div
            class="JsonSchemaViewer"
          >
            <div />
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
                      class="sl-truncate"
                    >
                      <span
                        class="sl-truncate sl-text-muted"
                        data-test="property-type"
                      >
                        dictionary[string, string]
                      </span>
                      <span
                        class="sl-text-muted"
                      >
                         or 
                      </span>
                      <span
                        class="sl-truncate sl-text-muted"
                        data-test="property-type"
                      >
                        null
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  it('should render top-level dictionary', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      additionalProperties: {
        type: 'string',
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              class=""
              id="mosaic-provider-react-aria-0-1"
            >
              <div
                class=""
                data-overlay-container="true"
              >
                <div
                  class="JsonSchemaViewer"
                >
                  <div />
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
                          <span
                            class="sl-truncate sl-text-muted"
                            data-test="property-type"
                          >
                            dictionary[string, string]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
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
                        <span
                          class="sl-truncate sl-text-muted"
                          data-test="property-type"
                        >
                          dictionary[string, string]
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });

  it('should not merge array of dictionaries', () => {
    const schema: JSONSchema7 = {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: {
          type: 'string',
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              class=""
              id="mosaic-provider-react-aria-0-1"
            >
              <div
                class=""
                data-overlay-container="true"
              >
                <div
                  class="JsonSchemaViewer"
                >
                  <div />
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
                            array
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
                      data-id="98538b996305d"
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
                            <span
                              class="sl-truncate sl-text-muted"
                              data-test="property-type"
                            >
                              dictionary[string, string]
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
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
                          array
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
                    data-id="98538b996305d"
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
                          <span
                            class="sl-truncate sl-text-muted"
                            data-test="property-type"
                          >
                            dictionary[string, string]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });

  it('should merge dictionaries with array values', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              class=""
              id="mosaic-provider-react-aria-0-1"
            >
              <div
                class=""
                data-overlay-container="true"
              >
                <div
                  class="JsonSchemaViewer"
                >
                  <div />
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
                            dictionary[string, array]
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
                      data-id="98538b996305d"
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
              </div>
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
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
                          dictionary[string, array]
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
                    data-id="98538b996305d"
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
            </div>
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });

  it('should not render true/false additionalProperties', () => {
    const schema: JSONSchema7 = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
      },
      additionalProperties: true,
    };

    const additionalTrue = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />);
    const additionalFalse = render(
      <JsonSchemaViewer schema={{ ...schema, additionalProperties: false }} defaultExpandedDepth={Infinity} />,
    );
    expect(additionalTrue.container.firstChild).toEqual(additionalFalse.container.firstChild);
    expect(additionalTrue.container.firstChild).toMatchInlineSnapshot(`
      <div
        class=""
        id="mosaic-provider-react-aria-0-1"
      >
        <div
          class=""
          data-overlay-container="true"
        >
          <div
            class="JsonSchemaViewer"
          >
            <div />
            <div
              class="sl-text-sm"
              data-level="0"
            >
              <div
                class="sl-flex sl-relative sl-max-w-full sl-py-2"
                data-id="8074f410d9775"
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
                        data-test="property-name-id"
                      >
                        id
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
        </div>
      </div>
    `);
  });

  it('should not render additionalItems', () => {
    const schema: JSONSchema7 = {
      type: 'array',
      additionalItems: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
        },
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              class=""
              id="mosaic-provider-react-aria-0-1"
            >
              <div
                class=""
                data-overlay-container="true"
              >
                <div
                  class="JsonSchemaViewer"
                >
                  <div />
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
                          <span
                            class="sl-truncate sl-text-muted"
                            data-test="property-type"
                          >
                            array
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
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
                        <span
                          class="sl-truncate sl-text-muted"
                          data-test="property-type"
                        >
                          array
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });

  describe('top level descriptions', () => {
    const schema: JSONSchema4 = {
      description: 'This is a description that should be rendered',
      allOf: [
        {
          type: 'object',
          properties: {
            foo: {
              type: 'string',
            },
          },
        },
        {
          type: 'object',
          properties: {
            baz: {
              type: 'string',
            },
          },
        },
      ],
    };

    it('should render top-level description on allOf', () => {
      expect(
        render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} />).container.firstChild,
      ).toMatchSnapshot();
    });

    it('should not render top-level description when skipTopLevelDescription=true', () => {
      expect(
        render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={Infinity} skipTopLevelDescription />).container
          .firstChild,
      ).toMatchSnapshot();
    });
  });
});

describe.each([{}, { unknown: '' }, { $ref: null }])('given empty schema: %o', schema => {
  it('should render empty text', () => {
    const wrapper = render(<JsonSchemaViewer schema={schema as any} />);
    const emptyText = wrapper.queryAllByTestId('empty-text');
    expect(emptyText[0]).toBeInTheDocument();
  });
});

describe('Expanded depth', () => {
  describe('merged array with object', () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: 'array',
        items: {
          type: 'object',
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
    });

    describe('static', () => {
      it('given initial level set to -1, should render only top-level property', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={-1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
                <div
                  class="sl-text-base sl-font-mono sl-font-semibold sl-pb-4"
                >
                  array of:
                </div>
                <div
                  class="sl-text-sm"
                  data-level="0"
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
                        class="sl-flex sl-items-center sl-max-w-full sl-cursor-pointer"
                      >
                        <div
                          class="sl-flex sl-justify-center sl-w-8 sl--ml-8 sl-pl-3 sl-text-muted"
                          role="button"
                        >
                          <svg
                            aria-hidden="true"
                            class="svg-inline--fa fa-chevron-right fa-fw fa-sm sl-icon"
                            data-icon="chevron-right"
                            data-prefix="fas"
                            focusable="false"
                            role="img"
                            viewBox="0 0 320 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
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
                            array[object]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it('given initial level set to 0, should render top 2 levels', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={0} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
                <div
                  class="sl-text-base sl-font-mono sl-font-semibold sl-pb-4"
                >
                  array of:
                </div>
                <div
                  class="sl-text-sm"
                  data-level="0"
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
                        class="sl-flex sl-items-center sl-max-w-full sl-cursor-pointer"
                      >
                        <div
                          class="sl-flex sl-justify-center sl-w-8 sl--ml-8 sl-pl-3 sl-text-muted"
                          role="button"
                        >
                          <svg
                            aria-hidden="true"
                            class="svg-inline--fa fa-chevron-right fa-fw fa-sm sl-icon"
                            data-icon="chevron-right"
                            data-prefix="fas"
                            focusable="false"
                            role="img"
                            viewBox="0 0 320 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
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
                            array[object]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it('given initial level set to 1, should render top 3 levels', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
                <div
                  class="sl-text-base sl-font-mono sl-font-semibold sl-pb-4"
                >
                  array of:
                </div>
                <div
                  class="sl-text-sm"
                  data-level="0"
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
                            array[object]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="sl-text-sm sl-ml-px sl-border-l"
                    data-level="1"
                  >
                    <div
                      class="sl-flex sl-relative sl-max-w-full sl-py-2 sl-pl-3"
                      data-id="f1c21cde4de6f"
                      data-test="schema-row"
                    >
                      <div
                        class="sl-w-1 sl-mt-2 sl-mr-3 sl--ml-3 sl-border-t"
                      />
                      <div
                        class="sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full sl-ml-2"
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
                              class="svg-inline--fa fa-chevron-right fa-fw fa-sm sl-icon"
                              data-icon="chevron-right"
                              data-prefix="fas"
                              focusable="false"
                              role="img"
                              viewBox="0 0 320 512"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
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
                              object
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });
    });
  });

  describe('merged array with object #2', () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            bar: {
              type: 'integer',
            },
            foo: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  bar: {
                    type: 'string',
                  },
                  foo: {
                    type: 'number',
                  },
                },
              },
            },
          },
        },
      };
    });

    describe('static', () => {
      it('given initial level set to -1, should render only top-level property', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={-1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
                <div
                  class="sl-text-base sl-font-mono sl-font-semibold sl-pb-4"
                >
                  array of:
                </div>
                <div
                  class="sl-text-sm"
                  data-level="0"
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
                            integer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="sl-flex sl-relative sl-max-w-full sl-py-2"
                    data-id="862ab7c3a6663"
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
                            class="svg-inline--fa fa-chevron-right fa-fw fa-sm sl-icon"
                            data-icon="chevron-right"
                            data-prefix="fas"
                            focusable="false"
                            role="img"
                            viewBox="0 0 320 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
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
                            array[object]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it('given initial level set to 0, should render top 2 levels', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={0} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
                <div
                  class="sl-text-base sl-font-mono sl-font-semibold sl-pb-4"
                >
                  array of:
                </div>
                <div
                  class="sl-text-sm"
                  data-level="0"
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
                            integer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="sl-flex sl-relative sl-max-w-full sl-py-2"
                    data-id="862ab7c3a6663"
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
                            class="svg-inline--fa fa-chevron-right fa-fw fa-sm sl-icon"
                            data-icon="chevron-right"
                            data-prefix="fas"
                            focusable="false"
                            role="img"
                            viewBox="0 0 320 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
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
                            array[object]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it('given initial level set to 1, should render top 3 levels', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
                <div
                  class="sl-text-base sl-font-mono sl-font-semibold sl-pb-4"
                >
                  array of:
                </div>
                <div
                  class="sl-text-sm"
                  data-level="0"
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
                            integer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="sl-flex sl-relative sl-max-w-full sl-py-2"
                    data-id="862ab7c3a6663"
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
                            array[object]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="sl-text-sm sl-ml-px sl-border-l"
                    data-level="1"
                  >
                    <div
                      class="sl-flex sl-relative sl-max-w-full sl-py-2 sl-pl-3"
                      data-id="f1c21cde4de6f"
                      data-test="schema-row"
                    >
                      <div
                        class="sl-w-3 sl-mt-2 sl-mr-3 sl--ml-3 sl-border-t"
                      />
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
                    <div
                      class="sl-flex sl-relative sl-max-w-full sl-py-2 sl-pl-3"
                      data-id="c6321b8d80105"
                      data-test="schema-row"
                    >
                      <div
                        class="sl-w-3 sl-mt-2 sl-mr-3 sl--ml-3 sl-border-t"
                      />
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
                              number
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });
    });
  });

  describe('nested object', () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: 'object',
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
    });

    describe('static', () => {
      it('given initial level set to -1, should render only top-level property', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={-1} />);

        expect(wrapper.container.firstChild).toMatchInlineSnapshot(`
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
                <div
                  class="sl-text-sm"
                  data-level="0"
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
                        class="sl-flex sl-items-center sl-max-w-full sl-cursor-pointer"
                      >
                        <div
                          class="sl-flex sl-justify-center sl-w-8 sl--ml-8 sl-pl-3 sl-text-muted"
                          role="button"
                        >
                          <svg
                            aria-hidden="true"
                            class="svg-inline--fa fa-chevron-right fa-fw fa-sm sl-icon"
                            data-icon="chevron-right"
                            data-prefix="fas"
                            focusable="false"
                            role="img"
                            viewBox="0 0 320 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
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
                            object
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="sl-flex sl-relative sl-max-w-full sl-py-2"
                    data-id="862ab7c3a6663"
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
                            class="svg-inline--fa fa-chevron-right fa-fw fa-sm sl-icon"
                            data-icon="chevron-right"
                            data-prefix="fas"
                            focusable="false"
                            role="img"
                            viewBox="0 0 320 512"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M96 480c-8.188 0-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L242.8 256L73.38 86.63c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l192 192c12.5 12.5 12.5 32.75 0 45.25l-192 192C112.4 476.9 104.2 480 96 480z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
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
                            array[object]
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
      });

      it('given initial level set to 0, should render top 2 levels', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={0} />);

        expect(wrapper.container.firstChild).toMatchSnapshot();
      });

      it('given initial level set to 1, should render top 3 levels', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={1} />);

        expect(wrapper.container.firstChild).toMatchSnapshot();
      });

      it('given initial level set to 2, should render top 4 levels', () => {
        const wrapper = render(<JsonSchemaViewer schema={schema} defaultExpandedDepth={2} />);

        expect(wrapper.container.firstChild).toMatchSnapshot();
      });
    });
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

    expect(render(<JsonSchemaViewer schema={schema} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              class=""
              id="mosaic-provider-react-aria-0-1"
            >
              <div
                class=""
                data-overlay-container="true"
              >
                <div
                  class="JsonSchemaViewer"
                >
                  <div />
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
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
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
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });

  it('should render caret for top-level array with $ref items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: {
        $ref: '#/foo',
      },
    };

    expect(render(<JsonSchemaViewer schema={schema} />)).toMatchInlineSnapshot(`
      {
        "asFragment": [Function],
        "baseElement": <body>
          <div>
            <div
              class=""
              id="mosaic-provider-react-aria-0-1"
            >
              <div
                class=""
                data-overlay-container="true"
              >
                <div
                  class="JsonSchemaViewer"
                >
                  <div />
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
                            $ref(#/foo)[]
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      class="sl-inline-block sl-ml-1.5"
                    >
                      <svg
                        aria-hidden="true"
                        aria-label="Could not resolve '#/foo'"
                        class="svg-inline--fa fa-triangle-exclamation fa-1x sl-icon"
                        color="var(--color-danger)"
                        data-icon="triangle-exclamation"
                        data-prefix="fas"
                        focusable="false"
                        role="img"
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>
                  <div
                    class="sl-text-sm"
                    data-level="0"
                  >
                    <div
                      class="sl-flex sl-relative sl-max-w-full sl-py-2"
                      data-id="98538b996305d"
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
                            <span
                              class="sl-truncate"
                              data-test="property-type-ref"
                            >
                              #/foo
                            </span>
                          </div>
                        </div>
                      </div>
                      <span
                        class="sl-inline-block sl-ml-1.5"
                      >
                        <svg
                          aria-hidden="true"
                          aria-label="Could not resolve '#/foo'"
                          class="svg-inline--fa fa-triangle-exclamation fa-1x sl-icon"
                          color="var(--color-danger)"
                          data-icon="triangle-exclamation"
                          data-prefix="fas"
                          focusable="false"
                          role="img"
                          viewBox="0 0 512 512"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
                            fill="currentColor"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </body>,
        "container": <div>
          <div
            class=""
            id="mosaic-provider-react-aria-0-1"
          >
            <div
              class=""
              data-overlay-container="true"
            >
              <div
                class="JsonSchemaViewer"
              >
                <div />
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
                          $ref(#/foo)[]
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    class="sl-inline-block sl-ml-1.5"
                  >
                    <svg
                      aria-hidden="true"
                      aria-label="Could not resolve '#/foo'"
                      class="svg-inline--fa fa-triangle-exclamation fa-1x sl-icon"
                      color="var(--color-danger)"
                      data-icon="triangle-exclamation"
                      data-prefix="fas"
                      focusable="false"
                      role="img"
                      viewBox="0 0 512 512"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                </div>
                <div
                  class="sl-text-sm"
                  data-level="0"
                >
                  <div
                    class="sl-flex sl-relative sl-max-w-full sl-py-2"
                    data-id="98538b996305d"
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
                          <span
                            class="sl-truncate"
                            data-test="property-type-ref"
                          >
                            #/foo
                          </span>
                        </div>
                      </div>
                    </div>
                    <span
                      class="sl-inline-block sl-ml-1.5"
                    >
                      <svg
                        aria-hidden="true"
                        aria-label="Could not resolve '#/foo'"
                        class="svg-inline--fa fa-triangle-exclamation fa-1x sl-icon"
                        color="var(--color-danger)"
                        data-icon="triangle-exclamation"
                        data-prefix="fas"
                        focusable="false"
                        role="img"
                        viewBox="0 0 512 512"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M506.3 417l-213.3-364c-16.33-28-57.54-28-73.98 0l-213.2 364C-10.59 444.9 9.849 480 42.74 480h426.6C502.1 480 522.6 445 506.3 417zM232 168c0-13.25 10.75-24 24-24S280 154.8 280 168v128c0 13.25-10.75 24-23.1 24S232 309.3 232 296V168zM256 416c-17.36 0-31.44-14.08-31.44-31.44c0-17.36 14.07-31.44 31.44-31.44s31.44 14.08 31.44 31.44C287.4 401.9 273.4 416 256 416z"
                          fill="currentColor"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        "debug": [Function],
        "findAllByAltText": [Function],
        "findAllByDisplayValue": [Function],
        "findAllByLabelText": [Function],
        "findAllByPlaceholderText": [Function],
        "findAllByRole": [Function],
        "findAllByTestId": [Function],
        "findAllByText": [Function],
        "findAllByTitle": [Function],
        "findByAltText": [Function],
        "findByDisplayValue": [Function],
        "findByLabelText": [Function],
        "findByPlaceholderText": [Function],
        "findByRole": [Function],
        "findByTestId": [Function],
        "findByText": [Function],
        "findByTitle": [Function],
        "getAllByAltText": [Function],
        "getAllByDisplayValue": [Function],
        "getAllByLabelText": [Function],
        "getAllByPlaceholderText": [Function],
        "getAllByRole": [Function],
        "getAllByTestId": [Function],
        "getAllByText": [Function],
        "getAllByTitle": [Function],
        "getByAltText": [Function],
        "getByDisplayValue": [Function],
        "getByLabelText": [Function],
        "getByPlaceholderText": [Function],
        "getByRole": [Function],
        "getByTestId": [Function],
        "getByText": [Function],
        "getByTitle": [Function],
        "queryAllByAltText": [Function],
        "queryAllByDisplayValue": [Function],
        "queryAllByLabelText": [Function],
        "queryAllByPlaceholderText": [Function],
        "queryAllByRole": [Function],
        "queryAllByTestId": [Function],
        "queryAllByText": [Function],
        "queryAllByTitle": [Function],
        "queryByAltText": [Function],
        "queryByDisplayValue": [Function],
        "queryByLabelText": [Function],
        "queryByPlaceholderText": [Function],
        "queryByRole": [Function],
        "queryByTestId": [Function],
        "queryByText": [Function],
        "queryByTitle": [Function],
        "rerender": [Function],
        "unmount": [Function],
      }
    `);
  });
});

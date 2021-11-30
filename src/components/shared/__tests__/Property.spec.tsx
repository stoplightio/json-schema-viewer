import 'jest-enzyme';

import { Provider as MosaicProvider } from '@stoplight/mosaic';
import { mount, ReactWrapper } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaRow, Types } from '../..';
import { buildTree, findNodeWithPath } from './utils';

describe('Property component', () => {
  const toUnmount: ReactWrapper[] = [];

  function render(schema: JSONSchema4, nodePath?: readonly string[]) {
    const tree = buildTree(schema);

    const node = nodePath ? findNodeWithPath(tree, nodePath) : tree.children[0];

    if (node === undefined) {
      throw new Error('Schema node not found in tree');
    }
    const wrapper = mount(
      <MosaicProvider>
        <SchemaRow schemaNode={node} nestingLevel={0} />
      </MosaicProvider>,
    );

    toUnmount.push(wrapper);

    return wrapper;
  }

  afterEach(() => {
    while (toUnmount.length > 0) {
      toUnmount.pop()?.unmount();
    }
  });

  it('should render Types with proper type and subtype', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: {
        type: 'string',
      },
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types).first().html()).toMatchInlineSnapshot(
      `"<span class=\\"sl-truncate sl-text-muted\\">array[string]</span>"`,
    );
  });

  it('should handle nullish items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: null as any,
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types).first().html()).toMatchInlineSnapshot(
      `"<span class=\\"sl-truncate sl-text-muted\\">array</span>"`,
    );
  });

  it('should handle nullish $ref', () => {
    const schema: JSONSchema4 = {
      $ref: null as any,
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types).first().html()).toMatchInlineSnapshot(`"<span class=\\"sl-truncate\\">$ref</span>"`);
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

      const wrapper = render(schema, ['properties', 'foo']);
      expect(wrapper.find(SchemaRow).html()).toMatchInlineSnapshot(
        `"<div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div>"`,
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

      const wrapper = render(schema, ['properties', 'foo']);
      expect(wrapper.find(SchemaRow).html()).toMatchInlineSnapshot(
        `"<div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">array[integer]</span></div></div></div></div>"`,
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

      const wrapper = render(schema, ['items', 'properties', 'foo']);
      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<div class=\\"\\" id=\\"mosaic-provider-react-aria-0-1\\"><div data-overlay-container=\\"true\\" class=\\"\\"><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div></div></div>"`,
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

      const wrapper = render(schema);
      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<div class=\\"\\" id=\\"mosaic-provider-react-aria-0-1\\"><div data-overlay-container=\\"true\\" class=\\"\\"><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-select sl-relative\\"><div style=\\"border: 0px; clip-path: inset(50%); height: 1px; margin: 0px -1px -1px 0px; overflow: hidden; padding: 0px; position: absolute; width: 1px; white-space: nowrap;\\" aria-hidden=\\"true\\"><input type=\\"text\\" tabindex=\\"-1\\" style=\\"font-size: 16px;\\"><label><select size=\\"2\\" tabindex=\\"-1\\"><option></option><option value=\\"0\\">array[strings]</option><option value=\\"1\\">array[numbers]</option></select></label></div><div class=\\"sl-relative\\"><button aria-label=\\"Pick a type\\" aria-haspopup=\\"listbox\\" aria-expanded=\\"false\\" id=\\"react-aria-0-4\\" aria-labelledby=\\"react-aria-0-4 react-aria-0-6\\" type=\\"button\\" class=\\"sl-button sl-w-full sl-h-sm sl-text-base sl-font-normal sl-px-1.5 sl-bg-transparent sl-rounded sl-border-transparent hover:sl-border-input focus:sl-border-primary active:sl-border-primary sl-border disabled:sl-opacity-60\\"><div class=\\"sl-flex sl-flex-1 sl-justify-items-start sl-items-center\\"><div class=\\"sl-pr-1\\">array[strings]</div></div><div class=\\"sl-text-xs sl--mr-0.5 sl-ml-1\\"><div class=\\"sl-pt-0.5 sl-pr-0.5\\"><svg aria-hidden=\\"true\\" focusable=\\"false\\" data-prefix=\\"fas\\" data-icon=\\"chevron-down\\" class=\\"svg-inline--fa fa-chevron-down fa-w-14 fa-xs sl-icon\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 448 512\\"><path fill=\\"currentColor\\" d=\\"M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z\\"></path></svg></div></div></button></div></div></div></div></div></div></div></div>"`,
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

      const wrapper = render(schema);
      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<div class=\\"\\" id=\\"mosaic-provider-react-aria-0-1\\"><div data-overlay-container=\\"true\\" class=\\"\\"><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full sl-cursor-pointer\\"><div class=\\"sl-flex sl-justify-center sl-w-8 sl--ml-8 sl-pl-3 sl-text-muted\\" role=\\"button\\"><svg aria-hidden=\\"true\\" focusable=\\"false\\" data-prefix=\\"fas\\" data-icon=\\"chevron-down\\" class=\\"svg-inline--fa fa-chevron-down fa-w-14 fa-fw fa-sm sl-icon\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 448 512\\"><path fill=\\"currentColor\\" d=\\"M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z\\"></path></svg></div><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><span class=\\"sl-truncate sl-text-muted\\">array[object]</span></div></div></div></div><div data-level=\\"0\\" class=\\"sl-stack sl-stack--vertical sl-stack--4 sl-flex sl-flex-col sl-items-stretch sl-text-sm\\"><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">foo</div></div></div></div></div><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">bar</div></div></div></div></div><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">baz</div></div></div></div></div></div></div></div>"`,
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

      let wrapper = render(schema, ['properties', 'array-all-objects', 'items', 'properties', 'foo']);
      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<div class=\\"\\" id=\\"mosaic-provider-react-aria-0-1\\"><div data-overlay-container=\\"true\\" class=\\"\\"><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div></div></div>"`,
      );

      wrapper = render(schema, ['properties', 'array-all-objects', 'items', 'properties', 'bar']);
      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<div class=\\"\\" id=\\"mosaic-provider-react-aria-0-1\\"><div data-overlay-container=\\"true\\" class=\\"\\"><div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">bar</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div></div></div>"`,
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

      const wrapper = mount(<SchemaRow schemaNode={findNodeWithPath(tree, ['properties', 'foo'])!} nestingLevel={0} />);
      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<div class=\\"sl-flex sl-max-w-full\\"><div class=\\"sl-stack sl-stack--vertical sl-stack--1 sl-flex sl-flex-1 sl-flex-col sl-items-stretch sl-max-w-full\\"><div class=\\"sl-flex sl-items-center sl-max-w-full\\"><div class=\\"sl-flex sl-flex-1 sl-items-baseline sl-sticky sl-top-0 sl-text-base\\"><div class=\\"sl-font-mono sl-font-semibold sl-mr-2\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">object</span></div></div></div></div>"`,
      );
      wrapper.unmount();
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

      const wrapper = render(schema);
      expect(wrapper.find(Types).first().html()).toMatchInlineSnapshot(
        `"<span class=\\"sl-truncate sl-text-muted\\">User</span>"`,
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

      const wrapper = render(schema);
      expect(wrapper.find(Types).first().html()).toMatchInlineSnapshot(
        `"<span class=\\"sl-truncate sl-text-muted\\">array[User]</span>"`,
      );
    });

    it('given array with no items, should render title', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        title: 'User',
      };

      const wrapper = render(schema);
      expect(wrapper.find(Types).first().html()).toMatchInlineSnapshot(
        `"<span class=\\"sl-truncate sl-text-muted\\">User</span>"`,
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

      const wrapper = render(schema);
      expect(wrapper.find(Types).first().html()).toMatchInlineSnapshot(
        `"<span class=\\"sl-truncate sl-text-muted\\">array</span>"`,
      );
    });
  });
});

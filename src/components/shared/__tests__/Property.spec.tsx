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
      `"<span class=\\"sl-truncate sl-text-muted\\">array of strings</span>"`,
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
        `"<div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div><div></div></div></div>"`,
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
        `"<div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">array of integers</span></div></div></div></div><div></div></div></div>"`,
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
        `"<div class=\\"\\"><div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div><div></div></div></div></div>"`,
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
        `"<div class=\\"\\"><div class=\\"sl-text-sm sl-relative\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-select sl-relative\\"><div style=\\"border: 0px; clip-path: inset(50%); height: 1px; margin: 0px -1px -1px 0px; overflow: hidden; padding: 0px; position: absolute; width: 1px; white-space: nowrap;\\" aria-hidden=\\"true\\"><input type=\\"text\\" tabindex=\\"-1\\" style=\\"font-size: 16px;\\"><label><select size=\\"2\\" tabindex=\\"-1\\"><option value=\\"0\\">1. array of strings</option><option value=\\"1\\">2. array of numbers</option></select></label></div><div class=\\"sl-relative\\"><button aria-haspopup=\\"listbox\\" aria-expanded=\\"false\\" aria-label=\\"Pick a type\\" id=\\"react-aria-0-3\\" aria-labelledby=\\"react-aria-0-3 react-aria-0-5\\" type=\\"button\\" class=\\"sl-button sl-w-full sl-h-sm sl-text-base sl-font-normal sl-px-1.5 sl-bg-transparent sl-text-body sl-rounded sl-border-transparent hover:sl-border-input focus:sl-border-primary disabled:sl-opacity-50\\"><div class=\\"sl-flex sl-flex-grow sl-justify-items-start sl-items-center\\"><div class=\\"sl-pr-1\\">1. array of strings</div></div><div class=\\"sl--mr-0.5 sl-ml-0.5\\"><svg aria-hidden=\\"true\\" focusable=\\"false\\" data-prefix=\\"fas\\" data-icon=\\"chevron-down\\" class=\\"svg-inline--fa fa-chevron-down fa-w-14 fa-xs sl-icon\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 448 512\\"><path fill=\\"currentColor\\" d=\\"M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z\\"></path></svg></div></button></div></div></div></div></div></div><div></div></div></div></div>"`,
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
        `"<div class=\\"\\"><div class=\\"sl-text-sm sl-relative\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"sl-cursor-pointer\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-absolute sl-justify-center sl-items-center sl-p-1 sl-cursor-pointer sl-text-muted\\" style=\\"width: 20px; height: 20px; position: relative; left: -7px;\\" role=\\"button\\"><svg aria-hidden=\\"true\\" focusable=\\"false\\" data-prefix=\\"fas\\" data-icon=\\"chevron-down\\" class=\\"svg-inline--fa fa-chevron-down fa-w-14 fa-xs sl-icon\\" role=\\"img\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 448 512\\"><path fill=\\"currentColor\\" d=\\"M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z\\"></path></svg></div><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><span class=\\"sl-truncate sl-text-muted\\">array of objects</span></div></div></div></div><div></div></div><div><div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">foo</div></div></div></div></div><div></div></div></div><div class=\\"sl-border-t sl-border-light sl-self-stretch\\"></div><div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">bar</div></div></div></div></div><div></div></div></div><div class=\\"sl-border-t sl-border-light sl-self-stretch\\"></div><div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">baz</div></div></div></div></div><div></div></div></div></div></div></div>"`,
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
        `"<div class=\\"\\"><div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div><div></div></div></div></div>"`,
      );

      wrapper = render(schema, ['properties', 'array-all-objects', 'items', 'properties', 'bar']);
      expect(wrapper.html()).toMatchInlineSnapshot(
        `"<div class=\\"\\"><div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">bar</div><span class=\\"sl-truncate sl-text-muted\\">string</span></div></div></div></div><div></div></div></div></div>"`,
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
        `"<div class=\\"sl-text-sm sl-relative\\" style=\\"margin-left: 20px;\\"><div class=\\"sl-flex\\"><div class=\\"sl-min-w-0 sl-flex-grow\\"><div class=\\"\\"><div class=\\"sl-flex sl-items-center sl-my-2\\"><div class=\\"sl-flex sl-items-baseline sl-text-base sl-flex-1\\"><div class=\\"sl-mr-2 sl-font-mono sl-font-bold\\">foo</div><span class=\\"sl-truncate sl-text-muted\\">object</span></div></div></div></div><div></div></div></div>"`,
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
        `"<span class=\\"sl-truncate sl-text-muted\\">array of User-s</span>"`,
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

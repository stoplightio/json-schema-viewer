import 'jest-enzyme';

import { TreeListNode, TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { shallow, ShallowWrapper } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { SchemaTree } from '../../../tree';
import { Property, Types } from '../../shared';

function getTopLevelNode(schema: JSONSchema4, pos: number): TreeListNode {
  const tree = new SchemaTree(schema, new TreeState(), {
    expandedDepth: Infinity,
    mergeAllOf: true,
    resolveRef: void 0,
    shouldResolveEagerly: false,
    onPopulate: void 0,
  });

  tree.populate();

  return tree.itemAt(pos)!;
}

function render(schema: JSONSchema4, pos = 0) {
  const treeNode = getTopLevelNode(schema, pos);

  return shallow(<Property node={treeNode} />);
}

function findCounter(wrapper: ShallowWrapper) {
  return wrapper.findWhere(el => /^{\d\}$/.test(el.text()));
}

describe('Property component', () => {
  it('should render Types with proper type and subtype', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: {
        type: 'string',
      },
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types)).toHaveHTML(
      '<span class="text-green-6 dark:text-green-4 truncate">array[string]</span>',
    );
  });

  it('should handle nullish items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: null as any,
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types)).toHaveHTML('<span class="text-green-6 dark:text-green-4 truncate">array</span>');
  });

  it('should handle nullish $ref', () => {
    const schema: JSONSchema4 = {
      $ref: null as any,
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types)).toHaveHTML('<span class="text-purple-6 dark:text-purple-4 truncate">$ref</span>');
  });

  describe('properties counter', () => {
    it('given an object among other types, should still display the counter', () => {
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

      const wrapper = render(schema);
      expect(findCounter(wrapper).first()).toHaveText('{1}');
      wrapper.unmount();
    });

    it('given missing properties property, should not display the counter', () => {
      const schema: JSONSchema4 = {
        type: 'object',
      };

      const wrapper = render(schema);
      expect(findCounter(wrapper)).not.toExist();
      wrapper.unmount();
    });

    it('given nullish properties property, should not display the counter', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: null as any,
      };

      const wrapper = render(schema);
      expect(findCounter(wrapper)).not.toExist();
      wrapper.unmount();
    });

    it('given object properties property, should display the counter', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {},
      };

      const wrapper = render(schema);
      expect(findCounter(wrapper).first()).toHaveText('{0}');
      wrapper.unmount();
    });
  });

  describe('properties names', () => {
    it('given an object, should display names its properties', () => {
      const schema: JSONSchema4 = {
        properties: {
          foo: {
            type: 'string',
          },
        },
      };

      const wrapper = render(schema, 1);
      expect(wrapper.find('div').first()).toHaveText('foo');
      wrapper.unmount();
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

      const wrapper = render(schema, 1);
      expect(wrapper.find('div').first()).toHaveText('foo');
      wrapper.unmount();
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

      const wrapper = render(schema, 1);
      expect(wrapper.find('div').first()).toHaveText('foo');
      wrapper.unmount();
    });

    it('given an array with a combiner inside, should just render the type of combiner', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        items: {
          oneOf: [
            {
              properties: {},
            },
          ],
          type: 'object',
        },
      };

      const wrapper = render(schema, 1);
      expect(wrapper).toHaveHTML('<span class="text-orange-5 truncate">oneOf</span>');
      wrapper.unmount();
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

      let wrapper = render(schema, 2);
      expect(wrapper).toHaveHTML(
        '<div class="mr-2">foo</div><span class="text-green-7 dark:text-green-5 truncate">string</span>',
      );
      wrapper.unmount();

      wrapper = render(schema, 3);
      expect(wrapper).toHaveHTML(
        '<div class="mr-2">bar</div><span class="text-green-7 dark:text-green-5 truncate">string</span>',
      );
      wrapper.unmount();
    });

    it('given a ref pointing at complex type, should not display property name', () => {
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

      const tree = new SchemaTree(schema, new TreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate: void 0,
      });

      tree.populate();
      tree.unwrap(Array.from(tree)[1] as TreeListParentNode);

      const wrapper = shallow(<Property node={tree.itemAt(2)!} />);
      expect(wrapper.find('div').first()).not.toExist();
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
      expect(wrapper.find(Types)).toHaveHTML('<span class="text-blue-6 dark:text-blue-4 truncate">User</span>');
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
      expect(wrapper.find(Types)).toHaveHTML('<span class="text-green-6 dark:text-green-4 truncate">User[]</span>');
    });

    it('given array with no items, should render title', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        title: 'User',
      };

      const wrapper = render(schema);
      expect(wrapper.find(Types)).toHaveHTML('<span class="text-green-6 dark:text-green-4 truncate">User</span>');
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
      expect(wrapper.find(Types)).toHaveHTML('<span class="text-green-6 dark:text-green-4 truncate">array</span>');
    });
  });

  it("no title for combiner's children", () => {
    const schema: JSONSchema4 = {
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
      oneOf: [
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

    const wrapper = render(schema);
    expect(wrapper.children().first()).toEqual(wrapper.find(Types));
  });
});

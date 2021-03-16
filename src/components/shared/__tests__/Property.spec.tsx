import 'jest-enzyme';

import { mount, ReactWrapper } from 'enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';

import { Property, Types } from '../../shared';
import { buildTree } from './utils';

function findCounter(wrapper: ReactWrapper) {
  return wrapper.findWhere(el => /^{\d\}$/.test(el.text()));
}

describe('Property component', () => {
  const toUnmount: ReactWrapper[] = [];

  function render(schema: JSONSchema4, pos = 0) {
    const tree = buildTree(schema);

    const wrapper = mount(<Property schemaNode={tree.children[pos]} />);

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
    console.log(wrapper.debug());
    expect(wrapper.find(Types)).toHaveHTML('<span class="sl-truncate sl-text-muted">array[string]</span>');
  });

  it('should handle nullish items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: null as any,
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types)).toHaveHTML('<span class="sl-truncate sl-text-muted">array</span>');
  });

  it('should handle nullish $ref', () => {
    const schema: JSONSchema4 = {
      $ref: null as any,
    };

    const wrapper = render(schema);
    expect(wrapper.find(Types)).toHaveHTML('<span class="sl-truncate">$ref</span>');
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
    });

    it('given missing properties property, should not display the counter', () => {
      const schema: JSONSchema4 = {
        type: 'object',
      };

      const wrapper = render(schema);
      expect(findCounter(wrapper)).not.toExist();
    });

    it('given nullish properties property, should not display the counter', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: null as any,
      };

      const wrapper = render(schema);
      expect(findCounter(wrapper)).not.toExist();
    });

    it('given object property with no properties inside, should not display the counter', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {},
      };

      const wrapper = render(schema);
      expect(findCounter(wrapper)).not.toExist();
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

      const wrapper = render(schema);
      expect(wrapper.find('div').first()).toHaveText('foo');
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

      const wrapper = render(schema, 0);
      expect(wrapper).toHaveHTML(
        '<span class="sl-truncate sl-text-muted">array[oneOf]</span><div class="sl-ml-2 sl-text-muted">{2}</div>',
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

      const wrapper = render(schema, 0);
      expect(wrapper).toHaveHTML(
        '<span class="sl-truncate sl-text-muted">array[object]</span><div class="sl-ml-2 sl-text-muted">{3}</div>',
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

      let wrapper = render(schema, 3);
      expect(wrapper).toHaveHTML(
        '<div class="sl-font-mono sl-font-bold sl-mr-2">foo</div><span class="sl-truncate sl-text-muted">string</span>',
      );

      wrapper = render(schema, 5);
      expect(wrapper).toHaveHTML(
        '<div class="sl-font-mono sl-font-bold sl-mr-2">bar</div><span class="sl-truncate sl-text-muted">string</span>',
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

      const wrapper = mount(<Property schemaNode={tree} />);
      expect(wrapper.find('div')).toHaveHTML('<div class="sl-font-mono sl-font-bold sl-mr-2">foo</div>');
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
      expect(wrapper.find(Types)).toHaveHTML('<span class="sl-truncate sl-text-muted">User</span>');
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
      expect(wrapper.find(Types)).toHaveHTML('<span class="sl-truncate sl-text-muted">User[]</span>');
    });

    it('given array with no items, should render title', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        title: 'User',
      };

      const wrapper = render(schema);
      expect(wrapper.find(Types)).toHaveHTML('<span class="sl-truncate sl-text-muted">User</span>');
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
      expect(wrapper.find(Types)).toHaveHTML('<span class="sl-truncate sl-text-muted">array</span>');
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

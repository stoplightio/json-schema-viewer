import { TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { SchemaTree } from '../../tree';
import { metadataStore } from '../../tree/metadata';
import { walk } from '../../tree/utils/walk';
import { SchemaTreeListNode } from '../../types';
import { Property, Types } from '../shared';

describe('Property component', () => {
  it('should render Types with proper type and subtype', () => {
    const treeNode: SchemaTreeListNode = {
      id: 'foo',
      name: '',
      parent: null,
    };

    const schema: JSONSchema4 = {
      type: 'array',
      items: {
        type: 'string',
      },
    };

    metadataStore.set(treeNode, {
      schemaNode: walk(schema).next().value.node,
      path: [],
      schema,
    });

    const wrapper = shallow(<Property node={treeNode} />);
    expect(wrapper.find(Types)).toExist();
    expect(wrapper.find(Types)).toHaveProp('type', 'array');
    expect(wrapper.find(Types)).toHaveProp('subtype', 'string');
  });

  it('should handle nullish items', () => {
    const treeNode: SchemaTreeListNode = {
      id: 'foo',
      name: '',
      parent: null,
    };

    const schema: JSONSchema4 = {
      type: 'array',
      items: null as any,
    };

    metadataStore.set(treeNode, {
      schemaNode: walk(schema).next().value.node,
      path: [],
      schema,
    });

    const wrapper = shallow(<Property node={treeNode} />);
    expect(wrapper).not.toBeEmptyRender();
  });

  it('should handle nullish $ref', () => {
    const treeNode: SchemaTreeListNode = {
      id: 'foo',
      name: '',
      parent: null,
    };

    const schema: JSONSchema4 = {
      $ref: null as any,
    };

    metadataStore.set(treeNode, {
      schemaNode: walk(schema).next().value.node,
      path: [],
      schema,
    });

    const wrapper = shallow(<Property node={treeNode} onGoToRef={jest.fn()} />);
    expect(wrapper).not.toBeEmptyRender();
  });

  describe('properties counter', () => {
    test('given an object among other types, should still display the counter', () => {
      const treeNode: SchemaTreeListNode = {
        id: 'foo',
        name: '',
        parent: null,
      };

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

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.findWhere(el => /^{\d\}$/.test(el.text())).first()).toHaveText('{1}');
    });

    it('given missing properties property, should not display the counter', () => {
      const treeNode: SchemaTreeListNode = {
        id: 'foo',
        name: '',
        parent: null,
      };

      const schema: JSONSchema4 = {
        type: 'object',
      };

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.findWhere(el => /^{\d\}$/.test(el.text()))).not.toExist();
    });

    it('given nullish properties property, should not display the counter', () => {
      const treeNode: SchemaTreeListNode = {
        id: 'foo',
        name: '',
        parent: null,
      };

      const schema: JSONSchema4 = {
        type: 'object',
        properties: null as any,
      };

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.findWhere(el => /^{\d\}$/.test(el.text()))).not.toExist();
    });

    it('given object properties property, should display the counter', () => {
      const treeNode: SchemaTreeListNode = {
        id: 'foo',
        name: '',
        parent: null,
      };

      const schema: JSONSchema4 = {
        type: 'object',
        properties: {},
      };

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.findWhere(el => /^{\d\}$/.test(el.text())).first()).toHaveText('{0}');
    });
  });

  describe('properties names', () => {
    test('given an object, should display names its properties', () => {
      const schema: JSONSchema4 = {
        properties: {
          foo: {
            type: 'string',
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

      const wrapper = shallow(<Property node={tree.itemAt(1)!} />);
      expect(wrapper.find('div').first()).toHaveText('foo');
    });

    test('given an object among other types, should still display its properties', () => {
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

      const tree = new SchemaTree(schema, new TreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate: void 0,
      });

      tree.populate();

      const wrapper = shallow(<Property node={tree.itemAt(1)!} />);
      expect(wrapper.find('div').first()).toHaveText('foo');
    });

    test('given an array of objects, should display names of those properties', () => {
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

      const tree = new SchemaTree(schema, new TreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate: void 0,
      });

      tree.populate();

      const wrapper = shallow(<Property node={tree.itemAt(1)!} />);
      expect(wrapper.find('div').first()).toHaveText('foo');
    });

    test('given a ref pointing at primitive type, should not display property name', () => {
      const schema: JSONSchema4 = {
        properties: {
          foo: {
            $ref: '#/properties/bar',
          },
          bar: {
            type: 'string',
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

    test('given a ref pointing at complex type, should not display property name', () => {
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
    let treeNode: SchemaTreeListNode;

    beforeEach(() => {
      treeNode = {
        id: 'foo',
        name: '',
        parent: null,
      };
    });

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

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.find(Types)).toExist();
      expect(wrapper.find(Types)).toHaveProp('type', 'object');
      expect(wrapper.find(Types)).toHaveProp('subtype', void 0);
      expect(wrapper.find(Types)).toHaveProp('title', 'User');
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

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.find(Types)).toExist();
      expect(wrapper.find(Types)).toHaveProp('type', 'array');
      expect(wrapper.find(Types)).toHaveProp('subtype', 'object');
      expect(wrapper.find(Types)).toHaveProp('title', 'User');
    });

    it('given array with no items, should render title', () => {
      const schema: JSONSchema4 = {
        type: 'array',
        title: 'User',
      };

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.find(Types)).toExist();
      expect(wrapper.find(Types)).toHaveProp('type', 'array');
      expect(wrapper.find(Types)).toHaveProp('subtype', void 0);
      expect(wrapper.find(Types)).toHaveProp('title', 'User');
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

      metadataStore.set(treeNode, {
        schemaNode: walk(schema).next().value.node,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.find(Types)).toExist();
      expect(wrapper.find(Types)).toHaveProp('type', 'array');
      expect(wrapper.find(Types)).toHaveProp('subtype', void 0);
      expect(wrapper.find(Types)).toHaveProp('title', void 0);
    });
  });
});

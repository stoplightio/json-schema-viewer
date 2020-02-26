import { TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { SchemaTree } from '../../tree';
import { metadataStore } from '../../tree/metadata';
import { walk } from '../../tree/walk';
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
      schemaNode: walk(schema).next().value,
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
      schemaNode: walk(schema).next().value,
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
      schemaNode: walk(schema).next().value,
      path: [],
      schema,
    });

    const wrapper = shallow(<Property node={treeNode} onGoToRef={jest.fn()} />);
    expect(wrapper).not.toBeEmptyRender();
  });

  describe('properties counter', () => {
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
        schemaNode: walk(schema).next().value,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.findWhere(el => /^\{\d\}$/.test(el.text()))).not.toExist();
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
        schemaNode: walk(schema).next().value,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.findWhere(el => /^\{\d\}$/.test(el.text()))).not.toExist();
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
        schemaNode: walk(schema).next().value,
        path: [],
        schema,
      });

      const wrapper = shallow(<Property node={treeNode} />);
      expect(wrapper.findWhere(el => /^\{\d\}$/.test(el.text())).first()).toHaveText('{0}');
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
      });

      tree.populate();

      const wrapper = shallow(<Property node={Array.from(tree)[1]} />);
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
      });

      tree.populate();

      const wrapper = shallow(<Property node={Array.from(tree)[1]} />);
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
      });

      tree.populate();
      tree.unwrap(Array.from(tree)[1] as TreeListParentNode);

      const wrapper = shallow(<Property node={Array.from(tree)[2]} />);
      expect(wrapper.find('div').first()).not.toExist();
    });

    xtest('given a ref pointing at complex type, should not display property name', () => {
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
      });

      tree.populate();
      tree.unwrap(Array.from(tree)[1] as TreeListParentNode);

      const wrapper = shallow(<Property node={Array.from(tree)[2]} />);
      expect(wrapper.find('div').first()).not.toExist();
    });
  });
});

import { TreeListParentNode } from '@stoplight/tree-list';
import { Popover } from '@stoplight/ui-kit';
import { shallow } from 'enzyme';
import 'jest-enzyme';
import { JSONSchema4 } from 'json-schema';
import * as React from 'react';
import { SchemaTree } from '../../tree';
import { metadataStore } from '../../tree/metadata';
import { SchemaTreeState } from '../../tree/state';
import { SchemaKind, SchemaTreeListNode } from '../../types';
import { SchemaErrorRow, SchemaPropertyRow, SchemaRow } from '../SchemaRow';
import { Caret } from '../shared';
import { Validations } from '../shared/Validations';

describe('SchemaRow component', () => {
  test('should render falsy validations', () => {
    const node: SchemaTreeListNode = {
      id: '0.n1f7tvhzoj',
      name: '',
      parent: null,
    };

    metadataStore.set(node, {
      schemaNode: {
        name: '',
        id: '232',
        type: SchemaKind.Object,
        validations: {
          enum: [null, 0, false],
        },
        annotations: {},
        enum: [null, 0, false],
      } as any,
      schema: {} as any,
      path: [],
    });

    const rowOptions = {
      isEdited: false,
      isExpanded: true,
    };

    const schema: JSONSchema4 = {
      $ref: '#/definitions/foo',
      definitions: {
        foo: {
          type: 'string',
        },
      },
    };

    const tree = new SchemaTree(schema, new SchemaTreeState(), {
      expandedDepth: Infinity,
      mergeAllOf: false,
      resolveRef: void 0,
      shouldResolveEagerly: false,
      onPopulate: void 0,
    });

    const wrapper = shallow(
      shallow(<SchemaRow node={node} rowOptions={rowOptions} schemaTree={tree} />)
        .find(SchemaPropertyRow)
        .shallow()
        .find(Validations)
        .shallow()
        .find(Popover)
        .prop('content') as React.ReactElement,
    );

    expect(wrapper).toHaveText('enum:null,0,false');
  });

  test('should render caret for top-level $ref', () => {
    const schema: JSONSchema4 = {
      $ref: '#/definitions/foo',
      definitions: {
        foo: {
          type: 'string',
        },
      },
    };

    const tree = new SchemaTree(schema, new SchemaTreeState(), {
      expandedDepth: Infinity,
      mergeAllOf: false,
      resolveRef: void 0,
      shouldResolveEagerly: false,
      onPopulate: void 0,
    });

    tree.populate();

    const wrapper = shallow(<SchemaRow node={tree.itemAt(0)!} rowOptions={{}} schemaTree={tree} />)
      .find(SchemaPropertyRow)
      .shallow();

    expect(wrapper.find(Caret)).toExist();
    expect(wrapper.find(Caret)).toHaveProp('style', {
      height: 20,
      position: 'relative',
      width: 20,
    });
  });

  test('should render caret for top-level array with $ref items', () => {
    const schema: JSONSchema4 = {
      type: 'array',
      items: {
        $ref: '#/foo',
      },
    };

    const tree = new SchemaTree(schema, new SchemaTreeState(), {
      expandedDepth: Infinity,
      mergeAllOf: false,
      resolveRef: void 0,
      shouldResolveEagerly: false,
      onPopulate: void 0,
    });

    tree.populate();

    const wrapper = shallow(<SchemaRow node={tree.itemAt(0)!} rowOptions={{}} schemaTree={tree} />)
      .find(SchemaPropertyRow)
      .shallow();

    expect(wrapper.find(Caret)).toExist();
    expect(wrapper.find(Caret)).toHaveProp('style', {
      height: 20,
      position: 'relative',
      width: 20,
    });
  });

  describe('expanding errors', () => {
    describe('$refs', () => {
      let tree: SchemaTree;

      beforeEach(() => {
        const schema: JSONSchema4 = {
          type: 'object',
          properties: {
            user: {
              $ref: '#/properties/foo',
            },
          },
        };

        tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: false,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();
      });

      test('given no custom resolver, should render a generic error message', () => {
        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        const wrapper = shallow(<SchemaRow node={tree.itemAt(2)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaErrorRow)
          .shallow();
        expect(wrapper).toHaveText(`Could not dereference "#/properties/foo"`);
      });

      test('given a custom resolver, should render a message thrown by it', () => {
        const message = "I don't know how to resolve it. Sorry";
        tree.treeOptions.resolveRef = () => {
          throw new Error(message);
        };

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        const wrapper = shallow(<SchemaRow node={tree.itemAt(2)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaErrorRow)
          .shallow();
        expect(wrapper).toHaveText(message);
      });
    });
  });

  describe('required property', () => {
    let tree: SchemaTree;

    beforeEach(() => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {
          user: {
            $ref: '#/properties/id',
          },
          id: {
            type: 'object',
            required: ['foo'],
            properties: {
              foo: {
                type: 'string',
              },
              bar: {
                type: 'number',
              },
            },
          },
        },
      };

      tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate: void 0,
      });

      tree.populate();
      tree.unwrap(tree.itemAt(1) as TreeListParentNode);
    });

    test('should preserve the required validation', () => {
      const wrapper = shallow(<SchemaRow node={tree.itemAt(6)!} rowOptions={{}} schemaTree={tree} />)
        .find(SchemaPropertyRow)
        .shallow();
      expect(wrapper.find(Validations)).toHaveProp('required', true);
    });

    test('should preserve the optional validation', () => {
      const wrapper = shallow(<SchemaRow node={tree.itemAt(7)!} rowOptions={{}} schemaTree={tree} />)
        .find(SchemaPropertyRow)
        .shallow();

      expect(wrapper.find(Validations)).toHaveProp('required', false);
    });

    describe('given a referenced object', () => {
      test('should preserve the required validation', () => {
        const wrapper = shallow(<SchemaRow node={tree.itemAt(3)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaPropertyRow)
          .shallow();

        expect(wrapper.find(Validations)).toHaveProp('required', true);
      });

      test('should preserve the optional validation', () => {
        const wrapper = shallow(<SchemaRow node={tree.itemAt(4)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaPropertyRow)
          .shallow();

        expect(wrapper.find(Validations)).toHaveProp('required', false);
      });
    });

    describe('given array with items', () => {
      beforeEach(() => {
        const schema: JSONSchema4 = {
          title: 'test',
          type: 'array',
          items: {
            type: 'object',
            properties: {
              code: {
                type: 'number',
              },
              msg: {
                type: 'string',
              },
              ref: {
                type: 'string',
              },
            },
            required: ['code', 'msg'],
          },
        };

        tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: false,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();
      });

      test.each([1, 2])('should preserve the required validation for %i item', pos => {
        const wrapper = shallow(<SchemaRow node={tree.itemAt(pos)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaPropertyRow)
          .shallow();

        expect(wrapper.find(Validations)).toHaveProp('required', true);
      });

      test('should preserve the optional validation', () => {
        const wrapper = shallow(<SchemaRow node={tree.itemAt(3)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaPropertyRow)
          .shallow();

        expect(wrapper.find(Validations)).toHaveProp('required', false);
      });
    });

    describe('given array with arrayish items', () => {
      beforeEach(() => {
        const schema: JSONSchema4 = {
          title: 'test',
          type: 'array',
          items: [
            {
              type: 'object',
              properties: {
                code: {
                  type: 'number',
                },
                msg: {
                  type: 'string',
                },
                ref: {
                  type: 'string',
                },
              },
              required: ['code', 'msg'],
            },
          ],
        };

        tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: false,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();
      });

      test.each([2, 3])('should preserve the required validation for %i item', pos => {
        const wrapper = shallow(<SchemaRow node={tree.itemAt(pos)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaPropertyRow)
          .shallow();

        expect(wrapper.find(Validations)).toHaveProp('required', true);
      });

      test('should preserve the optional validation', () => {
        const wrapper = shallow(<SchemaRow node={tree.itemAt(4)!} rowOptions={{}} schemaTree={tree} />)
          .find(SchemaPropertyRow)
          .shallow();

        expect(wrapper.find(Validations)).toHaveProp('required', false);
      });
    });
  });
});

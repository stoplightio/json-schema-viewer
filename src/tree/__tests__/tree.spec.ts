import { TreeListParentNode } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import { getNodeMetadata } from '../metadata';
import { SchemaTree, SchemaTreeState } from '../tree';

describe('SchemaTree', () => {
  describe('expanding', () => {
    describe('oneOf combiner', () => {
      let tree: SchemaTree;
      let schema: JSONSchema4;

      beforeEach(() => {
        schema = {
          type: 'object',
          properties: {
            user: {
              $ref: '#/properties/id',
            },
            id: {
              oneOf: [
                {
                  type: 'object',
                  required: ['foo'],
                  properties: {
                    foo: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        };

        tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef: void 0,
        });

        tree.populate();
      });

      test('upon expanded $ref, should insert only oneOf combiner', () => {
        expect(tree.count).toEqual(3);

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);

        expect(tree.count).toEqual(4);
        expect(getNodeMetadata(tree.itemAt(2)!)).toHaveProperty(
          'schema',
          expect.objectContaining({
            oneOf: [
              {
                type: 'object',
                required: ['foo'],
                properties: {
                  foo: {
                    type: 'string',
                  },
                },
              },
            ],
          }),
        );
      });

      test('upon expanded $ref and expanded oneOf combiner, should insert object', () => {
        expect(tree.count).toEqual(3);

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        tree.unwrap(tree.itemAt(2) as TreeListParentNode);

        expect(tree.count).toEqual(5);
        expect(getNodeMetadata(tree.itemAt(3)!)).toHaveProperty(
          'schema',
          expect.objectContaining({
            type: 'object',
            required: ['foo'],
            properties: {
              foo: {
                type: 'string',
              },
            },
          }),
        );
      });

      test('upon expanded id property, should insert object', () => {
        expect(tree.count).toEqual(3);

        tree.unwrap(tree.itemAt(2) as TreeListParentNode);

        expect(tree.count).toEqual(4);
        expect(getNodeMetadata(tree.itemAt(3)!)).toHaveProperty(
          'schema',
          expect.objectContaining({
            type: 'object',
            required: ['foo'],
            properties: {
              foo: {
                type: 'string',
              },
            },
          }),
        );
      });
    });

    describe('array with $reffed items', () => {
      let tree: SchemaTree;
      let schema: JSONSchema4;

      beforeEach(() => {
        schema = {
          type: 'object',
          properties: {
            user: {
              type: 'array',
              items: {
                $ref: '#/properties/id',
              },
            },
            id: {
              type: 'object',
              required: ['foo'],
              properties: {
                foo: {
                  type: 'string',
                },
              },
            },
          },
        };

        tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef: void 0,
        });

        tree.populate();
      });

      test('upon expanded array, should insert object', () => {
        expect(tree.count).toEqual(3);

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);

        expect(tree.count).toEqual(4);
        expect(getNodeMetadata(tree.itemAt(2)!)).toHaveProperty(
          'schema',
          expect.objectContaining({
            type: 'object',
            required: ['foo'],
            properties: {
              foo: {
                type: 'string',
              },
            },
          }),
        );
      });
    });
  });

  describe('paths generation', () => {
    let schema: JSONSchema4;
    let tree: SchemaTree;

    beforeEach(() => {
      schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
              address: {
                type: 'string',
              },
            },
          },
          permissions: {
            type: 'array',
            items: {
              $ref: '#/properties/user',
            },
          },
        },
      };

      tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: false,
        resolveRef: void 0,
      });
    });

    test('for root', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(0)!)).toHaveProperty('path', []);
    });

    test('for plain object member', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(1)!)).toHaveProperty('path', [
        'properties',
        'user'
      ]);
    });

    test('for deep object member', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(2)!)).toHaveProperty('path', [
        'properties',
        'user',
        'properties',
        'name',
      ]);
    });

    test('for array items', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(tree.count - 1)!)).toHaveProperty('path', [
        'properties',
        'permissions',
      ]);
    });

    test('for $reffed array items', () => {
      tree.populate();
      tree.unwrap(tree.itemAt(tree.count - 1) as TreeListParentNode);

      expect(getNodeMetadata(tree.itemAt(tree.count - 3)!)).toHaveProperty('path', [
        'properties',
        'permissions',
        'items',
      ]);

      expect(getNodeMetadata(tree.itemAt(tree.count - 2)!)).toHaveProperty('path', [
        'properties',
        'permissions',
        'items',
        'properties',
        'name',
      ]);

      expect(getNodeMetadata(tree.itemAt(tree.count - 1)!)).toHaveProperty('path', [
        'properties',
        'permissions',
        'items',
        'properties',
        'address',
      ]);
    });
  });
});

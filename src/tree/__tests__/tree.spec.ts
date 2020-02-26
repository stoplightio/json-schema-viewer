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
  });
});

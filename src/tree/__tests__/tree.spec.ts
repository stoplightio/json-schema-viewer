import { TreeListParentNode } from '@stoplight/tree-list';
import * as fs from 'fs';
import { JSONSchema4 } from 'json-schema';
import * as path from 'path';

import { ResolvingError } from '../../errors';
import { ViewMode } from '../../types';
import { getNodeMetadata } from '../metadata';
import { SchemaTree, SchemaTreeState } from '../tree';
import { printTree } from './utils/printTree';

describe('SchemaTree', () => {
  describe('expanding', () => {
    describe('internal $refs', () => {
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
            shouldResolveEagerly: false,
            onPopulate: void 0,
          });

          tree.populate();
        });

        it('upon expanded $ref, should insert only oneOf combiner', () => {
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

        it('upon expanded $ref and expanded oneOf combiner, should insert object', () => {
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

        it('upon expanded id property, should insert object', () => {
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
            shouldResolveEagerly: false,
            onPopulate: void 0,
          });

          tree.populate();
        });

        it('upon expanded array, should insert object', () => {
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

      it('should try to inject the title', () => {
        const schema: JSONSchema4 = {
          type: 'object',
          properties: {
            bar: {
              type: 'object',
              properties: {
                foo: {
                  $ref: '#/properties/user',
                },
              },
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

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();
        tree.unwrap(tree.itemAt(1) as TreeListParentNode);

        expect(getNodeMetadata(tree.itemAt(2)!)).toHaveProperty(
          'schemaNode',
          expect.objectContaining({
            $ref: '#/properties/user',
            title: 'User',
          }),
        );
      });
    });

    describe('empty $ref', () => {
      let schema: JSONSchema4;

      beforeEach(() => {
        schema = {
          type: 'object',
          properties: {
            id: {
              $ref: '',
            },
          },
        };
      });

      it('given no custom resolver, should generate an error', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty('error', 'The pointer is empty');
      });

      it('given a custom resolver, should attempt to resolve the reference', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef() {
            throw new ResolvingError('Seems like you do not want this to be empty.');
          },
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty(
          'error',
          'Seems like you do not want this to be empty.',
        );
      });
    });

    describe('external $refs', () => {
      let schema: JSONSchema4;

      beforeEach(() => {
        schema = {
          type: 'object',
          properties: {
            user: {
              type: 'array',
              items: {
                $ref: '../test#',
              },
            },
            id: {
              $ref: '../foo#id',
            },
          },
        };
      });

      it('given no custom resolver, should generate an error', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty(
          'error',
          'Cannot dereference external references',
        );

        tree.unwrap(tree.itemAt(3) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(4) as TreeListParentNode)).toHaveProperty(
          'error',
          'Cannot dereference external references',
        );
      });

      it('given a custom resolver, should attempt to resolve the reference', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef({ source, pointer }) {
            if (source === '../test') {
              throw new ResolvingError(`Could not read "${source}"`);
            }

            throw new ResolvingError(`Pointer "${pointer}" is missing`);
          },
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty(
          'error',
          'Could not read "../test"',
        );

        tree.unwrap(tree.itemAt(3) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(4) as TreeListParentNode)).toHaveProperty(
          'error',
          'Pointer "#id" is missing',
        );
      });
    });

    describe('$refs in allOf', () => {
      it('given $ref in allOf', () => {
        const schema: JSONSchema4 = {
          type: 'object',
          properties: {
            foo: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                id: {
                  type: 'number',
                },
              },
            },
            bar: {
              allOf: [
                {
                  $ref: '#/properties/foo',
                },
                {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        };

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();
        expect(printTree(tree)).toMatchInlineSnapshot(`
          "└─ #
             ├─ type: object
             └─ children
                ├─ 0
                │  └─ #/properties/foo
                │     ├─ type: object
                │     └─ children
                │        ├─ 0
                │        │  └─ #/properties/foo/properties/name
                │        │     └─ type: string
                │        └─ 1
                │           └─ #/properties/foo/properties/id
                │              └─ type: number
                └─ 1
                   └─ #/properties/bar
                      ├─ type: object
                      └─ children
                         ├─ 0
                         │  └─ #/properties/bar/properties/name
                         │     └─ type: string
                         ├─ 1
                         │  └─ #/properties/bar/properties/id
                         │     └─ type: number
                         └─ 2
                            └─ #/properties/bar/properties/address
                               └─ type: string
          "
        `);
      });

      it('given $ref in allOf pointing at another allOf, should keep merging', () => {
        const schema: JSONSchema4 = {
          type: 'object',
          properties: {
            baz: {
              type: 'object',
            },
            foo: {
              allOf: [
                {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                    },
                    id: {
                      type: 'number',
                    },
                  },
                },
                {
                  $ref: '#/properties/baz',
                },
              ],
            },
            bar: {
              allOf: [
                {
                  $ref: '#/properties/foo',
                },
                {
                  type: 'object',
                  properties: {
                    address: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        };

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        tree.populate();
        expect(printTree(tree)).toMatchInlineSnapshot(`
          "└─ #
             ├─ type: object
             └─ children
                ├─ 0
                │  └─ #/properties/baz
                │     └─ type: object
                ├─ 1
                │  └─ #/properties/foo
                │     ├─ type: object
                │     └─ children
                │        ├─ 0
                │        │  └─ #/properties/foo/properties/name
                │        │     └─ type: string
                │        └─ 1
                │           └─ #/properties/foo/properties/id
                │              └─ type: number
                └─ 2
                   └─ #/properties/bar
                      ├─ type: object
                      └─ children
                         ├─ 0
                         │  └─ #/properties/bar/properties/address
                         │     └─ type: string
                         ├─ 1
                         │  └─ #/properties/bar/properties/name
                         │     └─ type: string
                         └─ 2
                            └─ #/properties/bar/properties/id
                               └─ type: number
          "
        `);
      });

      it('given direct circular reference pointing at allOf, should bail out and display unmerged allOf', () => {
        const schema: JSONSchema4 = {
          type: 'object',
          properties: {
            foo: {
              allOf: [
                {
                  $ref: '#/properties/bar',
                },
              ],
            },
            bar: {
              allOf: [
                {
                  $ref: '#/properties/foo',
                },
                {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        };

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        expect(tree.populate.bind(tree)).not.toThrow();
        expect(printTree(tree)).toMatchInlineSnapshot(`
          "└─ #
             ├─ type: object
             └─ children
                ├─ 0
                │  └─ #/properties/foo
                │     ├─ combiner: allOf
                │     └─ children
                │        ├─ 0
                │        │  └─ #/properties/foo/allOf/0
                │        │     ├─ $ref: #/properties/foo
                │        │     └─ children
                │        └─ 1
                │           └─ #/properties/foo/allOf/1
                │              ├─ type: object
                │              └─ children
                │                 └─ 0
                │                    └─ #/properties/foo/allOf/1/properties/name
                │                       └─ type: string
                └─ 1
                   └─ #/properties/bar
                      ├─ type: object
                      ├─ combiner: allOf
                      └─ children
                         └─ 0
                            └─ #/properties/bar/allOf/0
                               ├─ $ref: #/properties/bar
                               └─ children
          "
        `);
      });

      it('given indirect circular reference pointing at allOf, should bail out and display unmerged allOf', () => {
        const schema: JSONSchema4 = {
          type: 'object',
          properties: {
            baz: {
              allOf: [
                {
                  $ref: '#/properties/bar',
                },
              ],
            },
            foo: {
              allOf: [
                {
                  $ref: '#/properties/baz',
                },
              ],
            },
            bar: {
              allOf: [
                {
                  $ref: '#/properties/foo',
                },
                {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        };

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        expect(tree.populate.bind(tree)).not.toThrow();
        expect(printTree(tree)).toMatchInlineSnapshot(`
          "└─ #
             ├─ type: object
             └─ children
                ├─ 0
                │  └─ #/properties/baz
                │     ├─ type: object
                │     ├─ combiner: allOf
                │     └─ children
                │        └─ 0
                │           └─ #/properties/baz/allOf/0
                │              ├─ $ref: #/properties/baz
                │              └─ children
                ├─ 1
                │  └─ #/properties/foo
                │     ├─ combiner: allOf
                │     └─ children
                │        ├─ 0
                │        │  └─ #/properties/foo/allOf/0
                │        │     ├─ $ref: #/properties/foo
                │        │     └─ children
                │        └─ 1
                │           └─ #/properties/foo/allOf/1
                │              ├─ type: object
                │              └─ children
                │                 └─ 0
                │                    └─ #/properties/foo/allOf/1/properties/name
                │                       └─ type: string
                └─ 2
                   └─ #/properties/bar
                      ├─ type: object
                      ├─ combiner: allOf
                      └─ children
                         └─ 0
                            └─ #/properties/bar/allOf/0
                               ├─ $ref: #/properties/bar
                               └─ children
          "
        `);
      });

      it('given circular reference inside of resolved allOf member, should bail out and display unmerged allOf', () => {
        const schema: JSONSchema4 = {
          components: {
            schemas: {
              Campaign: {
                type: 'object',
                allOf: [
                  {
                    $ref: '#/components/schemas/Discount',
                  },
                  {
                    properties: {
                      startDate: {
                        type: 'number',
                      },
                    },
                  },
                ],
              },
              Coupon: {
                type: 'object',
                allOf: [
                  {
                    $ref: '#/components/schemas/Discount',
                  },
                  {
                    properties: {
                      endDate: {
                        type: 'number',
                      },
                    },
                  },
                ],
              },
              Discount: {
                oneOf: [
                  {
                    $ref: '#/components/schemas/Coupon',
                  },
                  {
                    $ref: '#/components/schemas/Campaign',
                  },
                ],
              },
            },
          },
          properties: {
            Discount: {
              $ref: '#/components/schemas/Discount',
            },
          },
        };

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        expect(tree.populate.bind(tree)).not.toThrow();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        tree.unwrap(tree.itemAt(2) as TreeListParentNode);

        expect(printTree(tree)).toMatchInlineSnapshot(`
          "└─ #
             ├─ type: object
             └─ children
                └─ 0
                   └─ #/properties/Discount
                      ├─ $ref: #/components/schemas/Discount
                      └─ children
                         └─ 0
                            └─ #/properties/Discount
                               ├─ combiner: oneOf
                               └─ children
                                  ├─ 0
                                  │  └─ #/properties/Discount/oneOf/0
                                  │     ├─ type: object
                                  │     ├─ combiner: allOf
                                  │     └─ children
                                  │        ├─ 0
                                  │        │  └─ #/properties/Discount/oneOf/0/allOf/0
                                  │        │     ├─ $ref: #/components/schemas/Discount
                                  │        │     └─ children
                                  │        └─ 1
                                  │           └─ #/properties/Discount/oneOf/0/allOf/1
                                  │              ├─ type: object
                                  │              └─ children
                                  │                 └─ 0
                                  │                    └─ #/properties/Discount/oneOf/0/allOf/1/properties/endDate
                                  │                       └─ type: number
                                  └─ 1
                                     └─ #/properties/Discount/oneOf/1
                                        ├─ type: object
                                        ├─ combiner: allOf
                                        └─ children
                                           ├─ 0
                                           │  └─ #/properties/Discount/oneOf/1/allOf/0
                                           │     ├─ $ref: #/components/schemas/Discount
                                           │     └─ children
                                           └─ 1
                                              └─ #/properties/Discount/oneOf/1/allOf/1
                                                 ├─ type: object
                                                 └─ children
                                                    └─ 0
                                                       └─ #/properties/Discount/oneOf/1/allOf/1/properties/startDate
                                                          └─ type: number
          "
        `);
      });

      it('given very complex model with circular references, should bail out and display unmerged allOf', () => {
        const schema = require('../../__fixtures__/complex-allOf-model.json');

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        expect(tree.populate.bind(tree)).not.toThrow();
        expect(printTree(tree)).toMatchSnapshot();
      });

      it('given circular reference pointing at allOf that are not at top-level, should merge top-level allOf normally', () => {
        const schema: JSONSchema4 = {
          type: 'object',
          properties: {
            baz: {
              allOf: [
                {
                  $ref: '#/properties/bar',
                },
              ],
            },
            foo: {
              allOf: [
                {
                  $ref: '#/properties/baz',
                },
              ],
            },
            bar: {
              allOf: [
                {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                    address: {
                      type: 'object',
                      properties: {
                        street: {
                          $ref: '#/properties/foo',
                        },
                      },
                    },
                  },
                },
                {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                    },
                  },
                },
              ],
            },
          },
        };

        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: false,
          onPopulate: void 0,
        });

        expect(tree.populate.bind(tree)).not.toThrow();
        expect(printTree(tree)).toMatchInlineSnapshot(`
          "└─ #
             ├─ type: object
             └─ children
                ├─ 0
                │  └─ #/properties/baz
                │     ├─ type: object
                │     └─ children
                │        ├─ 0
                │        │  └─ #/properties/baz/properties/id
                │        │     └─ type: string
                │        ├─ 1
                │        │  └─ #/properties/baz/properties/address
                │        │     ├─ type: object
                │        │     └─ children
                │        │        └─ 0
                │        │           └─ #/properties/baz/properties/address/properties/street
                │        │              ├─ combiner: allOf
                │        │              └─ children
                │        │                 └─ 0
                │        │                    └─ #/properties/baz/properties/address/properties/street/allOf/0
                │        │                       ├─ $ref: #/properties/baz
                │        │                       └─ children
                │        └─ 2
                │           └─ #/properties/baz/properties/name
                │              └─ type: string
                ├─ 1
                │  └─ #/properties/foo
                │     ├─ combiner: allOf
                │     └─ children
                │        ├─ 0
                │        │  └─ #/properties/foo/allOf/0
                │        │     ├─ type: object
                │        │     └─ children
                │        │        ├─ 0
                │        │        │  └─ #/properties/foo/allOf/0/properties/id
                │        │        │     └─ type: string
                │        │        └─ 1
                │        │           └─ #/properties/foo/allOf/0/properties/address
                │        │              ├─ type: object
                │        │              └─ children
                │        │                 └─ 0
                │        │                    └─ #/properties/foo/allOf/0/properties/address/properties/street
                │        │                       ├─ $ref: #/properties/foo
                │        │                       └─ children
                │        └─ 1
                │           └─ #/properties/foo/allOf/1
                │              ├─ type: object
                │              └─ children
                │                 └─ 0
                │                    └─ #/properties/foo/allOf/1/properties/name
                │                       └─ type: string
                └─ 2
                   └─ #/properties/bar
                      ├─ type: object
                      └─ children
                         ├─ 0
                         │  └─ #/properties/bar/properties/id
                         │     └─ type: string
                         ├─ 1
                         │  └─ #/properties/bar/properties/address
                         │     ├─ type: object
                         │     └─ children
                         │        └─ 0
                         │           └─ #/properties/bar/properties/address/properties/street
                         │              ├─ combiner: allOf
                         │              └─ children
                         │                 └─ 0
                         │                    └─ #/properties/bar/properties/address/properties/street/allOf/0
                         │                       ├─ $ref: #/properties/bar
                         │                       └─ children
                         └─ 2
                            └─ #/properties/bar/properties/name
                               └─ type: string
          "
        `);
      });
    });
  });

  describe('allOf failures', () => {
    it('given incompatible values, should bail out and display unmerged allOf', () => {
      const schema: JSONSchema4 = {
        allOf: [
          {
            type: 'string',
          },
          {
            type: 'number',
          },
          {
            type: 'object',
            properties: {
              name: {
                type: 'string',
              },
            },
          },
        ],
      };

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate: void 0,
      });

      expect(tree.populate.bind(tree)).not.toThrow();
      expect(printTree(tree)).toMatchInlineSnapshot(`
        "└─ #
           ├─ combiner: allOf
           └─ children
              ├─ 0
              │  └─ #/allOf/0
              │     └─ type: string
              ├─ 1
              │  └─ #/allOf/1
              │     └─ type: number
              └─ 2
                 └─ #/allOf/2
                    ├─ type: object
                    └─ children
                       └─ 0
                          └─ #/allOf/2/properties/name
                             └─ type: string
        "
      `);
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
        shouldResolveEagerly: false,
        onPopulate: void 0,
      });
    });

    it('for root', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(0)!)).toHaveProperty('path', []);
    });

    it('for plain object member', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(1)!)).toHaveProperty('path', ['properties', 'user']);
    });

    it('for deep object member', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(2)!)).toHaveProperty('path', ['properties', 'user', 'properties', 'name']);
    });

    it('for array items', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(tree.count - 1)!)).toHaveProperty('path', ['properties', 'permissions']);
    });

    it('for $reffed array items', () => {
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

  describe('eager $ref resolving', () => {
    it('given a plain object with properties, should resolve', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {
          foo: {
            $ref: '#/properties/bar',
          },
          bar: {
            type: 'boolean',
          },
        },
      };

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchInlineSnapshot(`
        "└─ #
           ├─ type: object
           └─ children
              ├─ 0
              │  └─ #/properties/foo
              │     └─ type: boolean
              └─ 1
                 └─ #/properties/bar
                    └─ type: boolean
        "
      `);
    });

    it('given an array with $reffed items, should resolve', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: {
              $ref: '#/properties/bar',
            },
          },
          bar: {
            type: 'boolean',
          },
        },
      };

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchInlineSnapshot(`
        "└─ #
           ├─ type: object
           └─ children
              ├─ 0
              │  └─ #/properties/foo
              │     ├─ type: array
              │     └─ subtype: boolean
              └─ 1
                 └─ #/properties/bar
                    └─ type: boolean
        "
      `);
    });

    it('should leave broken $refs', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: {
              $ref: '#/properties/baz',
            },
          },
          bar: {
            $ref: '#/properties/bazinga',
          },
        },
      };

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchInlineSnapshot(`
          "└─ #
             ├─ type: object
             └─ children
                ├─ 0
                │  └─ #/properties/foo
                │     ├─ type: array
                │     ├─ subtype: $ref[#/properties/baz]
                │     └─ children
                └─ 1
                   └─ #/properties/bar
                      ├─ $ref: #/properties/bazinga
                      └─ children
          "
        `);
    });

    it('should handle circular references', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/properties/bar',
                },
              },
            },
          },
          bar: {
            $ref: '#/properties/baz',
          },
          baz: {
            $ref: '#/properties/foo',
          },
        },
      };

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchInlineSnapshot(`
        "└─ #
           ├─ type: object
           └─ children
              ├─ 0
              │  └─ #/properties/foo
              │     ├─ type: array
              │     ├─ subtype: object
              │     └─ children
              │        └─ 0
              │           └─ #/properties/foo/items/properties/user
              │              ├─ $ref: #/properties/baz
              │              └─ children
              ├─ 1
              │  └─ #/properties/bar
              │     ├─ $ref: #/properties/foo
              │     └─ children
              └─ 2
                 └─ #/properties/baz
                    ├─ type: array
                    ├─ subtype: object
                    └─ children
                       └─ 0
                          └─ #/properties/baz/items/properties/user
                             ├─ $ref: #/properties/baz
                             └─ children
        "
      `);
    });

    it('should handle resolving errors', () => {
      const schema: JSONSchema4 = {
        type: 'object',
        properties: {
          foo: {
            type: 'string',
          },
          bar: {
            $ref: 'http://localhost:8080/some/not/existing/path',
          },
        },
      };

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: () => {
          throw new Error('resolving error');
        },
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();

      expect(tree.count).toEqual(4);
      expect(getNodeMetadata(tree.itemAt(3)!)).toHaveProperty('error', 'resolving error');
    });
  });

  describe('onPopulate handler', () => {
    let schema: JSONSchema4;

    beforeEach(() => {
      schema = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: {
              $ref: '#/properties/bar',
            },
          },
          bar: {
            type: 'boolean',
          },
        },
      };
    });

    it('should be called when tree is computed for a first time', () => {
      const onPopulate = jest.fn();

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate,
      });

      expect(onPopulate).not.toBeCalled();

      tree.populate();

      expect(onPopulate).toBeCalledTimes(1);
      expect(onPopulate).toBeCalledWith(tree, tree.root);
    });

    it('given $ref resolution, should be called', () => {
      const onPopulate = jest.fn();

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate,
      });

      expect(onPopulate).not.toBeCalled();

      tree.populate();

      tree.unwrap(tree.itemAt(1) as TreeListParentNode);

      expect(onPopulate).toBeCalledTimes(2);
      expect(onPopulate).nthCalledWith(1, tree, tree.root);
      expect(onPopulate).nthCalledWith(2, tree, tree.itemAt(1));
    });

    it('given expanding, should be called', () => {
      const onPopulate = jest.fn();

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: -1,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: false,
        onPopulate,
      });

      expect(onPopulate).not.toBeCalled();

      tree.populate();

      tree.unwrap(tree.itemAt(0) as TreeListParentNode);

      expect(onPopulate).toBeCalledTimes(2);
      expect(onPopulate).nthCalledWith(1, tree, tree.root);
      expect(onPopulate).nthCalledWith(2, tree, tree.itemAt(0));
    });
  });

  describe('tree correctness', () => {
    // you can put tests verifying whether we generate expected tree
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

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchInlineSnapshot(`
        "└─ #
           ├─ type
           │  ├─ 0: string
           │  └─ 1: object
           └─ children
              └─ 0
                 └─ #/properties/ids
                    ├─ type: array
                    └─ subtype: integer
        "
      `);
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

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchInlineSnapshot(`
        "└─ #
           ├─ type: object
           └─ children
              └─ 0
                 └─ #/properties/items
                    ├─ type
                    │  ├─ 0: null
                    │  └─ 1: array
                    └─ subtype
                       ├─ 0: string
                       └─ 1: number
        "
      `);
    });

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

      it('given allOf merging disabled, should still merge', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: false,
          resolveRef: void 0,
          shouldResolveEagerly: true,
          onPopulate: void 0,
        });

        tree.populate();
        expect(printTree(tree)).toMatchSnapshot();
      });

      it('given allOf merging enabled, should merge contents of allOf combiners', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: Infinity,
          mergeAllOf: true,
          resolveRef: void 0,
          shouldResolveEagerly: true,
          onPopulate: void 0,
        });

        tree.populate();
        expect(printTree(tree)).toMatchSnapshot();
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

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchInlineSnapshot(`
        "└─ #
           ├─ type: array
           ├─ combiner: oneOf
           └─ children
              ├─ 0
              │  └─ #/oneOf/0
              │     ├─ type: array
              │     └─ subtype: string
              └─ 1
                 └─ #/oneOf/1
                    ├─ type: array
                    └─ subtype: number
        "
      `);
    });

    it.each(['standalone', 'read', 'write'])('given %s mode, should populate proper nodes', mode => {
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

      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
        viewMode: mode as ViewMode,
      });

      tree.populate();
      expect(tree.count).toEqual(mode === 'standalone' ? 3 : 2);
    });

    it.each(['array-of-allofs.json'])('should match %s', filename => {
      const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../__fixtures__', filename), 'utf8'));
      const tree = new SchemaTree(schema, new SchemaTreeState(), {
        expandedDepth: Infinity,
        mergeAllOf: true,
        resolveRef: void 0,
        shouldResolveEagerly: true,
        onPopulate: void 0,
      });

      tree.populate();
      expect(printTree(tree)).toMatchSnapshot();
    });
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

    const tree = new SchemaTree(schema, new SchemaTreeState(), {
      expandedDepth: 0,
      mergeAllOf: false,
      resolveRef: void 0,
      shouldResolveEagerly: false,
      onPopulate: void 0,
    });

    tree.populate();
    // tree.unwrap(tree.itemAt(0) as TreeListParentNode);

    expect(getNodeMetadata(tree.itemAt(1)!)).toHaveProperty(
      'schemaNode',
      expect.objectContaining({
        $ref: '#/properties/user',
        title: 'User',
      }),
    );
  });
});

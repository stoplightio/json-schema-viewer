import { TreeListParentNode } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import { ResolvingError } from '../../errors';
import { getNodeMetadata } from '../metadata';
import { SchemaTree, SchemaTreeState } from '../tree';
import { printTree } from './utils/printTree';

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
          })
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
          })
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
          })
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
          })
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

      test('given no custom resolver, should generate an error', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef: void 0,
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty('error', 'The pointer is empty');
      });

      test('given a custom resolver, should attempt to resolve the reference', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef() {
            throw new ResolvingError('Seems like you do not want this to be empty.');
          },
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty(
          'error',
          'Seems like you do not want this to be empty.'
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

      test('given no custom resolver, should generate an error', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef: void 0,
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty(
          'error',
          'Cannot dereference external references'
        );

        tree.unwrap(tree.itemAt(3) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(4) as TreeListParentNode)).toHaveProperty(
          'error',
          'Cannot dereference external references'
        );
      });

      test('given a custom resolver, should attempt to resolve the reference', () => {
        const tree = new SchemaTree(schema, new SchemaTreeState(), {
          expandedDepth: 0,
          mergeAllOf: false,
          resolveRef({ source, pointer }) {
            if (source === '../test') {
              throw new ResolvingError(`Could not read "${source}"`);
            }

            throw new ResolvingError(`Pointer "${pointer}" is missing`);
          },
        });

        tree.populate();

        tree.unwrap(tree.itemAt(1) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(2) as TreeListParentNode)).toHaveProperty(
          'error',
          'Could not read "../test"'
        );

        tree.unwrap(tree.itemAt(3) as TreeListParentNode);
        expect(getNodeMetadata(tree.itemAt(4) as TreeListParentNode)).toHaveProperty(
          'error',
          'Pointer "#id" is missing'
        );
      });
    });

    describe('$refs in allOf', () => {
      test('given $ref in allOf', () => {
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

      test('given $ref in allOf pointing at another allOf, should keep merging', () => {
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

      test('given direct circular reference pointing at allOf, should bail out and display unmerged allOf', () => {
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

      test('given indirect circular reference pointing at allOf, should bail out and display unmerged allOf', () => {
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

      test('given circular reference pointing at allOf that are not at top-level, should merge top-level allOf normally', () => {
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
    test('given incompatible values, should bail out and display unmerged allOf', () => {
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
      });
    });

    test('for root', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(0)!)).toHaveProperty('path', []);
    });

    test('for plain object member', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(1)!)).toHaveProperty('path', ['properties', 'user']);
    });

    test('for deep object member', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(2)!)).toHaveProperty('path', ['properties', 'user', 'properties', 'name']);
    });

    test('for array items', () => {
      tree.populate();

      expect(getNodeMetadata(tree.itemAt(tree.count - 1)!)).toHaveProperty('path', ['properties', 'permissions']);
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

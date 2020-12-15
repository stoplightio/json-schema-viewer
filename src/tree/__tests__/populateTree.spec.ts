import { Tree, TreeListParentNode } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';

import { getNodeMetadata } from '../metadata';
import { populateTree } from '../utils/populateTree';

describe('populateTree util', () => {
  it('given schema with complex types, throws', () => {
    const schema: JSONSchema4 = {
      type: [
        'null' as any,
        {
          type: 'object',
          properties: {
            taskId: {
              type: 'string',
              format: 'uuid',
            },
          },
        },
      ],
    };

    const root = Tree.createArtificialRoot();
    expect(() =>
      populateTree(schema, root, 0, [], {
        mergeAllOf: false,
        onNode: void 0,
        shouldResolveEagerly: false,
        stepIn: void 0,
        resolveRef() {
          return {};
        },
      }),
    ).toThrow(
      'The "type" property must be a string, or an array of strings. Objects and array of objects are not valid.',
    );
  });

  it('includes properties with unknown types', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      properties: {
        foo: {
          __ERROR__: 'dd',
        },
      },
    };

    const root = Tree.createArtificialRoot();
    populateTree(schema, root, 0, [], {
      mergeAllOf: false,
      onNode: void 0,
      shouldResolveEagerly: false,
      stepIn: void 0,
      resolveRef() {
        return {};
      },
    });
    expect(getNodeMetadata((root.children[0] as TreeListParentNode).children[0])).toHaveProperty('schema', {
      __ERROR__: 'dd',
    });
  });

  it('processes array with refed items correctly', () => {
    const schema: JSONSchema4 = {
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

    const root = Tree.createArtificialRoot();
    populateTree(schema, root, 0, [], {
      mergeAllOf: false,
      onNode: void 0,
      shouldResolveEagerly: false,
      stepIn: void 0,
      resolveRef() {
        return {};
      },
    });
    expect(((root.children[0] as TreeListParentNode).children[0] as TreeListParentNode).children).toHaveLength(0);
  });
});

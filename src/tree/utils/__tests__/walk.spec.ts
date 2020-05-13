import { SchemaKind } from '../../../types';
import { walk } from '../walk';

describe('Schema Walker', () => {
  describe('when type equals array', () => {
    test.each(['[circular]', 2, null])('given invalid items, should normalize them %s', items => {
      const schema = {
        type: SchemaKind.Array,
        items,
      };
      const { value: node } = walk(schema as any).next();

      expect(node).toStrictEqual({
        fragment: schema,
        node: {
          id: expect.any(String),
          type: SchemaKind.Array,
          annotations: {},
          enum: void 0,
          validations: {},
          additionalItems: void 0,
          items: void 0,
        },
      });
    });

    test.each([{ type: 'string' }, [{ type: 'number' }]])(
      'given valid items, should leave them untouched %s',
      items => {
        const schema = {
          type: SchemaKind.Array,
          items,
        };
        const { value: node } = walk(schema as any).next();

        expect(node).toStrictEqual({
          fragment: schema,
          node: {
            id: expect.any(String),
            type: SchemaKind.Array,
            annotations: {},
            enum: void 0,
            validations: {},
            additionalItems: void 0,
            items,
          },
        });
      },
    );
  });

  describe('when type equals object', () => {
    test.each(['[circular]', 2, null, [{}]])('given invalid properties, should normalize them %s', properties => {
      const schema = {
        type: SchemaKind.Object,
        properties,
      };
      const { value: node } = walk(schema as any).next();

      expect(node).toStrictEqual({
        fragment: schema,
        node: {
          id: expect.any(String),
          type: SchemaKind.Object,
          annotations: {},
          enum: void 0,
          validations: {},
          additionalProperties: void 0,
          patternProperties: void 0,
          properties: void 0,
        },
      });
    });

    test.each([{}, { foo: { type: 'string' } }])(
      'given valid properties, should leave them untouched %s',
      properties => {
        const schema = {
          type: SchemaKind.Object,
          properties,
        };
        const { value: node } = walk(schema as any).next();

        expect(node).toStrictEqual({
          fragment: schema,
          node: {
            id: expect.any(String),
            type: SchemaKind.Object,
            annotations: {},
            enum: void 0,
            validations: {},
            additionalProperties: void 0,
            patternProperties: void 0,
            properties,
          },
        });
      },
    );
  });
});

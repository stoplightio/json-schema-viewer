import { JSONSchema4 } from 'json-schema';
import { JSONSchemaCombinerName, SchemaKind } from '../../../types';
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

  describe('title', () => {
    describe.each<JSONSchemaCombinerName>(['allOf', 'oneOf', 'anyOf'])('when combiner equals %s', combiner => {
      test.each([null, 2, void 0, false, true, 0, {}, []])('should ignore %s invalid title', title => {
        const schema = {
          [combiner]: [],
          title,
        };

        const { value: node } = walk(schema as any).next();
        expect(node).not.toHaveProperty('node.title');
      });

      test.each(['', 'test', '[]'])('should include %s valid title', title => {
        const schema: JSONSchema4 = {
          [combiner]: [],
          title,
        };

        const { value: node } = walk(schema).next();
        expect(node).toHaveProperty('node.title', title);
      });
    });

    describe.each(Object.values(SchemaKind))('when type equals %s', type => {
      test.each([null, 2, void 0, false, true, 0, {}, []])('should ignore %s invalid title', title => {
        const schema = {
          type,
          title,
        };

        const { value: node } = walk(schema as any).next();
        expect(node).not.toHaveProperty('node.title');
      });

      test.each(['', 'test', '[]'])('should include %s valid title', title => {
        const schema: JSONSchema4 = {
          type,
          title,
        };

        const { value: node } = walk(schema).next();
        expect(node).toHaveProperty('node.title', title);
      });
    });

    describe('given node with $ref', () => {
      test.each([null, 2, void 0, false, true, 0, {}, []])('should ignore %s invalid title', title => {
        const schema = {
          $ref: '#/foo',
          title,
        };

        const { value: node } = walk(schema as any).next();
        expect(node).not.toHaveProperty('node.title');
      });

      test.each(['', 'test', '[]'])('should include %s valid title', title => {
        const schema: JSONSchema4 = {
          $ref: '#/foo',
          title,
        };

        const { value: node } = walk(schema).next();
        expect(node).toHaveProperty('node.title', title);
      });
    });

    describe('given node with enum', () => {
      test.each([null, 2, void 0, false, true, 0, {}, []])('should ignore %s invalid title', title => {
        const schema = {
          enum: [],
          title,
        };

        const { value: node } = walk(schema as any).next();
        expect(node).not.toHaveProperty('node.title');
      });

      test.each(['', 'test', '[]'])('should include %s valid title', title => {
        const schema: JSONSchema4 = {
          enum: [],
          title,
        };

        const { value: node } = walk(schema).next();
        expect(node).toHaveProperty('node.title', title);
      });
    });
  });

  test('should pick all combiners', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      allOf: [],
      oneOf: [],
      anyOf: [],
    };

    expect(Array.from(walk(schema))).toEqual([
      {
        fragment: schema,
        node: {
          annotations: {},
          combiner: 'anyOf',
          id: expect.any(String),
          properties: [],
          type: 'object',
        },
      },
      {
        fragment: schema,
        node: {
          annotations: {},
          combiner: 'oneOf',
          id: expect.any(String),
          properties: [],
          type: 'object',
        },
      },
      {
        fragment: schema,
        node: {
          annotations: {},
          combiner: 'allOf',
          id: expect.any(String),
          properties: [],
          type: 'object',
        },
      },
    ]);
  });
});

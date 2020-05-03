import { JSONSchema4 } from 'json-schema';
import { mergeAllOf } from '../mergeAllOf';

describe('mergeAllOf util', () => {
  describe('example merging', () => {
    test('given incompatible, should leave empty', () => {
      const schema: JSONSchema4 = {
        allOf: [
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                example: 'hello',
              },
            },
          },
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                example: 'bye',
              },
            },
          },
        ],
      };

      expect(mergeAllOf(schema, [], {} as any)).toEqual({
        properties: {
          bar: {
            example: null,
            type: 'string',
          },
        },
        type: 'object',
      });
    });

    test('given compatible, should merge normally', () => {
      const schema: JSONSchema4 = {
        allOf: [
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                example: 'hello',
              },
            },
          },
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                example: 'hello',
              },
            },
          },
        ],
      };

      expect(mergeAllOf(schema, [], {} as any)).toEqual({
        properties: {
          bar: {
            example: 'hello',
            type: 'string',
          },
        },
        type: 'object',
      });
    });
  });

  describe('enums merging', () => {
    test('given incompatible, should leave empty', () => {
      const schema: JSONSchema4 = {
        allOf: [
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                enum: ['jonas', 'frederik'],
              },
            },
          },
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                enum: ['john', 'chris'],
              },
            },
          },
        ],
      };

      expect(mergeAllOf(schema, [], {} as any)).toEqual({
        properties: {
          bar: {
            enum: [],
            type: 'string',
          },
        },
        type: 'object',
      });
    });

    test('given compatible, should merge normally', () => {
      const schema: JSONSchema4 = {
        allOf: [
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                enum: ['jonas', 'frederik'],
              },
            },
          },
          {
            type: 'object',
            properties: {
              bar: {
                type: 'string',
                enum: ['jonas', 'frederik'],
              },
            },
          },
        ],
      };

      expect(mergeAllOf(schema, [], {} as any)).toEqual({
        properties: {
          bar: {
            enum: ['jonas', 'frederik'],
            type: 'string',
          },
        },
        type: 'object',
      });
    });
  });
});

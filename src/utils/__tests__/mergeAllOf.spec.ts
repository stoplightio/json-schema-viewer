import { JSONSchema4 } from 'json-schema';
import { mergeAllOf } from '../mergeAllOf';

describe('mergeAllOf util', () => {
  describe('enums merging', () => {
    test('given incompatible, should mark enum as empty', () => {
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

      expect(mergeAllOf(schema, [], jest.fn())).toEqual({
        properties: {
          bar: {
            enum: [],
            type: 'string',
          },
        },
        type: 'object',
      });
    });

    test('given incompatible, should merge normally', () => {
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

      expect(mergeAllOf(schema, [], jest.fn())).toEqual({
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

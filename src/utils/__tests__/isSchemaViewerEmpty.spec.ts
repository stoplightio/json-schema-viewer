import { isSchemaViewerEmpty } from '../isSchemaViewerEmpty';

describe('isSchemaViewer function', () => {
  it('should return false if empty object is given', () => {
    expect(isSchemaViewerEmpty({})).toBe(false);
  });

  it('should return false if schema with no combiner is given', () => {
    expect(isSchemaViewerEmpty({ properties: {} })).toBe(false);
  });

  it('should return false if schema with non-empty combiner is given', () => {
    const schema = {
      allOf: [
        {
          properties: {
            id: {
              description: 'Group ID',
              type: 'string',
            },
          },
        },
        {
          $ref: '#/definitions/Group',
        },
      ],
    };

    expect(isSchemaViewerEmpty(schema)).toBe(false);
  });

  it('should return true if schema with empty combiner is given', () => {
    expect(isSchemaViewerEmpty({ allOf: [] })).toBe(true);
  });
});

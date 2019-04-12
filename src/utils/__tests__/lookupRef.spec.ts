import { JSONSchema4 } from 'json-schema';
import { lookupRef } from '../lookupRef';

describe('lookupRef util', () => {
  it('should return null if dereferenced schema is not provided', () => {
    expect(lookupRef(['properties'], undefined)).toBeNull();
  });

  it('should return null path is not found in dereferenced schema', () => {
    expect(lookupRef(['properties'], {})).toBeNull();
  });

  it('should return value for given path is found in dereferenced schema', () => {
    const schema: JSONSchema4 = {
      type: 'object',
      properties: {
        foo: {
          type: 'string',
        },
      },
    };

    expect(lookupRef(['properties', 'foo'], schema)).toEqual({
      type: 'string',
    });
  });
});

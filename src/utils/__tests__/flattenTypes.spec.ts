import { flattenTypes } from '../flattenTypes';

describe('flattenTypes util', () => {
  it.each(['string', 'number', ['object']])('given valid %s type, returns it', type => {
    expect(flattenTypes(type)).toEqual(type);
  });

  it('returns undefined when no valid type is found', () => {
    expect(flattenTypes(2)).toBeUndefined();
    expect(flattenTypes(void 0)).toBeUndefined();
    expect(flattenTypes('foo')).toBeUndefined();
    expect(flattenTypes(['test', 'foo'])).toBeUndefined();
    expect(flattenTypes({ type: 'bar' })).toBeUndefined();
  });

  it('deduplicate types', () => {
    expect(flattenTypes(['null', 'string', 'string'])).toEqual(['null', 'string']);
  });

  it('removes invalid types', () => {
    expect(flattenTypes(['foo', 'string'])).toEqual(['string']);
    expect(flattenTypes(['foo', { type: 'bar' }, 'string'])).toEqual(['string']);
    expect(flattenTypes(['foo', 'string'])).toEqual(['string']);
    expect(flattenTypes(['number', 2, null])).toEqual(['number']);
  });

  it('flattens types', () => {
    expect(flattenTypes([{ type: 'array' }, { type: 'object' }, { type: 'object' }, { type: 'number' }])).toEqual([
      'array',
      'object',
      'number',
    ]);
  });

  it.each([
    [
      { type: 'array', items: {} },
      { type: 'object', properties: {} },
    ],
    [{ type: 'string', enum: [] }],
    { type: 'number', minimum: 1 },
    { additionalProperties: 1 },
  ])('throws when complex type is met', type => {
    expect(flattenTypes.bind(null, type)).toThrow(
      'The "type" property must be a string, or an array of strings. Objects and array of objects are not valid.',
    );
  });
});

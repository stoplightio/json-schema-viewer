import { isCombiner } from '../isCombiner';

describe('isCombiner function', () => {
  test('should return false if object without combiner is given', () => {
    expect(isCombiner({})).toBe(false);
    expect(isCombiner({ properties: [] })).toBe(false);
  });

  test.each(['allOf', 'anyOf', 'oneOf'])('should return true if object with %s is given', prop => {
    expect(isCombiner({ [prop]: {} })).toBe(true);
  });
});

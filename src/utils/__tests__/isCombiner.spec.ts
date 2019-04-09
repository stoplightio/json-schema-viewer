import { isCombiner } from '../isCombiner';

describe('isCombiner function', () => {
  test('should return false if object without combiner is given', () => {
    expect(isCombiner({} as any)).toBe(false);
    expect(isCombiner({ properties: [] } as any)).toBe(false);
  });

  test.each(['allOf', 'anyOf', 'oneOf'])('should return true if object with %s is given', prop => {
    expect(isCombiner({ [prop]: {} } as any)).toBe(true);
  });
});

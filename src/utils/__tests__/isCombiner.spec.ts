import { isCombinerNode } from '../nodes';

describe('isCombinerNode function', () => {
  test('should return false if object without combiner is given', () => {
    expect(isCombinerNode({} as any)).toBe(false);
    expect(isCombinerNode({ properties: [] } as any)).toBe(false);
  });

  test.each(['allOf', 'anyOf', 'oneOf'])('should return true if object with %s is given', combiner => {
    expect(isCombinerNode({ combiner } as any)).toBe(true);
  });
});

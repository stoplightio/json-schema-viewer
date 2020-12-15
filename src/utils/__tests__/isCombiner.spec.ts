import { isCombinerNode } from '../guards';

describe('isCombinerNode function', () => {
  it('should return false if object without combiner is given', () => {
    expect(isCombinerNode({} as any)).toBe(false);
    expect(isCombinerNode({ properties: [] } as any)).toBe(false);
  });

  it.each(['allOf', 'anyOf', 'oneOf'])('should return true if object with %s is given', combiner => {
    expect(isCombinerNode({ combiner } as any)).toBe(true);
  });
});

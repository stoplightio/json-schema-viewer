import { getValidations } from '../getValidations';

describe('getValidations util', () => {
  describe('deprecated property', () => {
    it('given present x-deprecated, should include its value', () => {
      expect(getValidations({ 'x-deprecated': false })).toStrictEqual({ deprecated: false });
      expect(getValidations({ 'x-deprecated': false, deprecated: true })).toStrictEqual({ deprecated: false });
      expect(getValidations({ 'x-deprecated': true })).toStrictEqual({ deprecated: true });
    });

    it('given present deprecated, should include its value', () => {
      expect(getValidations({ deprecated: false })).toStrictEqual({ deprecated: false });
      expect(getValidations({ deprecated: true })).toStrictEqual({ deprecated: true });
    });

    it('given missing deprecated, should not include anything', () => {
      expect(getValidations({})).toStrictEqual({});
    });
  });

  it('should support integer type', () => {
    expect(
      getValidations({
        type: 'integer',
        minimum: 2,
        exclusiveMaximum: true,
        maximum: 20,
        multipleOf: 2,
      }),
    ).toStrictEqual({
      exclusiveMaximum: true,
      maximum: 20,
      minimum: 2,
      multipleOf: 2,
    });
  });
});

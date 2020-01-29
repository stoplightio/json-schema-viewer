import { getValidations } from '../getValidations';

describe('getValidations util', () => {
  describe('deprecated property', () => {
    test('given present x-deprecated, should include its value', () => {
      expect(getValidations({ 'x-deprecated': false })).toStrictEqual({ deprecated: false });
      expect(getValidations({ 'x-deprecated': false, deprecated: true })).toStrictEqual({ deprecated: false });
      expect(getValidations({ 'x-deprecated': true })).toStrictEqual({ deprecated: true });
    });

    test('given present deprecated, should include its value', () => {
      expect(getValidations({ deprecated: false })).toStrictEqual({ deprecated: false });
      expect(getValidations({ deprecated: true })).toStrictEqual({ deprecated: true });
    });

    test('given missing deprecated, should not include anything', () => {
      expect(getValidations({})).toStrictEqual({});
    });
  });
});

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

  describe('when oas format is specified', () => {
    test('given default range, should not ignore both minimum and maximum values', () => {
      expect(
        getValidations({
          type: 'integer',
          format: 'int64',
          minimum: 0 - Math.pow(2, 63),
          maximum: Math.pow(2, 63) - 1,
        }),
      ).toStrictEqual({ format: 'int64' });
    });

    test('given customized range, should include changed values', () => {
      expect(
        getValidations({ type: 'integer', format: 'int32', minimum: 20, maximum: Math.pow(2, 31) - 1 }),
      ).toStrictEqual({
        format: 'int32',
        minimum: 20,
      });

      expect(
        getValidations({
          type: 'number',
          format: 'float',
          minimum: 0 - Math.pow(2, 128),
          maximum: Math.pow(2, 16) - 1,
        }),
      ).toStrictEqual({
        format: 'float',
        maximum: Math.pow(2, 16) - 1,
      });
    });
  });

  test('should support integer type', () => {
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

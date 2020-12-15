// https://github.com/airbnb/enzyme/issues/1875#issuecomment-451177239
const r = jest.requireActual('react');

module.exports = {
  ...r,
  memo: jest.fn((x: Function) => x),
  useCallback: jest.fn((fn: Function) => fn),
};

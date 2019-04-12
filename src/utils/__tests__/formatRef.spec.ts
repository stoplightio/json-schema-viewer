import { formatRef } from '../formatRef';

describe('formatRef util', () => {
  it('should chop last segment', () => {
    expect(formatRef('#/definitions/address')).toEqual('address');
    expect(formatRef('#/responses/200')).toEqual('200');
    expect(formatRef('../todo.oas2.yaml#/partials/todo')).toEqual('todo');
  });

  it('should handle lack of slash', () => {
    expect(formatRef('address')).toEqual('address');
    expect(formatRef('200')).toEqual('200');
    expect(formatRef('')).toEqual('');
  });
});

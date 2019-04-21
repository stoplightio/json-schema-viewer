import { assignId } from '../assignId';

describe('assignId util', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  test('should generate random id', () => {
    mathRandomSpy.mockReturnValueOnce(0.54444).mockReturnValueOnce(0.321);

    expect(assignId({})).toEqual('0.jlle4v0fcep');
    expect(assignId({})).toEqual('0.bk0kqhutdje');
  });

  test('should return previously stored id for same node', () => {
    mathRandomSpy.mockReturnValueOnce(0.23);

    const node = {};
    const id = assignId(node);

    expect(assignId(node)).toEqual(id);
  });
});

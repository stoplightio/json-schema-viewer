import { generateId } from '../generateId';

describe('generateId util', () => {
  let mathRandomSpy: jest.SpyInstance;

  beforeEach(() => {
    mathRandomSpy = jest.spyOn(Math, 'random');
  });

  afterEach(() => {
    mathRandomSpy.mockRestore();
  });

  test('should generate random id', () => {
    mathRandomSpy.mockReturnValueOnce(0.54444).mockReturnValueOnce(0.321);

    expect(generateId()).toEqual('0.jlle4v0fcep');
    expect(generateId()).toEqual('0.bk0kqhutdje');
  });
});

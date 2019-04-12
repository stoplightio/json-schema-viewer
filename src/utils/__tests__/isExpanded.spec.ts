import { SchemaTreeNode } from '../../types';
import { isExpanded } from '../isExpanded';

describe('isExpanded util', () => {
  it('should always return true is expandedRows.all is true', () => {
    const node = { level: 3, path: ['properties', 'bar'] };

    expect(isExpanded(node as SchemaTreeNode, 1, { all: true })).toBe(true);
  });

  it('should return true if level is lower than defaultExpandedDepth', () => {
    const node = { level: 1, path: ['properties', 'test'] };

    expect(isExpanded(node as SchemaTreeNode, 2, {})).toBe(true);
  });

  it('should return false if path is set to false in expandedRows', () => {
    const path = ['foo', 'bar'];
    const node = { level: 1, path };

    expect(
      isExpanded(node as SchemaTreeNode, 2, {
        'foo.bar': false,
      })
    ).toBe(false);
  });

  it('should return false if path is set to false in expandedRows', () => {
    const path = ['foo', 'bar'];
    const node = { level: 1, path };

    expect(
      isExpanded(node as SchemaTreeNode, 2, {
        'foo.bar': false,
      })
    ).toBe(false);
  });

  it('should always return true if path is set to true in expandedRows', () => {
    const path = ['foo', 'bar'];
    const node = { level: 3, path };

    expect(
      isExpanded(node as SchemaTreeNode, 2, {
        'foo.bar': true,
      })
    ).toBe(true);
  });
});

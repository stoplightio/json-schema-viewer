import { isLocalRef } from '@stoplight/json';
import { Tree, TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { JSONSchema4 } from 'json-schema';
import { get } from 'lodash-es';
import { SchemaNode } from '../types';
import { isRefNode } from '../utils/guards';
import { MetadataStore } from './metadata';
import { populateTree } from './populateTree';

export class SchemaTree extends Tree {
  constructor(public schema: JSONSchema4, public state: TreeState, public defaultExpandedDepth: number) {
    super(Tree.createArtificialRoot());
  }

  protected readonly visited = new WeakSet();

  public populate() {
    const expanded = {};
    populateTree(this.schema, this.root, 0, [], {
      onNode: (node: SchemaNode, parentTreeNode, level: number): boolean => {
        if (isRefNode(node) && isLocalRef(node.$ref)) {
          expanded[node.id] = false;
        }

        if (MetadataStore[parentTreeNode.id] && isRefNode(MetadataStore[parentTreeNode.id].schema)) return false;
        return level <= this.defaultExpandedDepth + 1;
      },
    });
    this.state.expanded = expanded;
    this.invalidate();
  }

  public populateTreeFragment(parent: TreeListParentNode) {
    const { path } = MetadataStore[parent.id];
    const initialLevel = Tree.getLevel(parent);
    const artificialRoot = Tree.createArtificialRoot();
    populateTree(get(this.schema, path), artificialRoot, initialLevel, path, {
      onNode: (node: SchemaNode, parentTreeNode, level: number): boolean => {
        return level <= initialLevel + 1;
      },
    });
    this.insertTreeFragment(artificialRoot.children[0].children, parent.id);
  }

  public unwrap(node: TreeListParentNode) {
    if (isRefNode(MetadataStore[node.id].schema)) {
    } else if (node.children.length === 0 && !this.visited.has(node)) {
      this.populateTreeFragment(node);
      super.unwrap(node);
    } else {
      super.unwrap(node);
    }
  }
}

import { isLocalRef, pointerToPath } from '@stoplight/json';
import { Tree, TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { JsonPath } from '@stoplight/types/dist';
import { JSONSchema4 } from 'json-schema';
import { get } from 'lodash-es';
import { SchemaNode } from '../types';
import { isRefNode } from '../utils/guards';
import { getNodeMetadata, metadataStore } from './metadata';
import { populateTree } from './populateTree';

export class SchemaTree extends Tree {
  constructor(public schema: JSONSchema4, public state: TreeState, public expandedDepth: number) {
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

        const metadata = metadataStore.get(parentTreeNode);

        if (metadata !== void 0 && isRefNode(metadata.schema)) return false;
        return level <= this.expandedDepth + 1;
      },
    });
    this.state.expanded = expanded;
    this.invalidate();
  }

  public populateTreeFragment(parent: TreeListParentNode, path: JsonPath) {
    const initialLevel = Tree.getLevel(parent);
    const artificialRoot = Tree.createArtificialRoot();
    populateTree(get(this.schema, path), artificialRoot, initialLevel, path, {
      onNode: (node: SchemaNode, parentTreeNode, level: number) => level <= initialLevel + 1,
    });
    this.insertTreeFragment((artificialRoot.children[0] as TreeListParentNode).children, parent.id);
  }

  public unwrap(node: TreeListParentNode) {
    if (node.children.length !== 0 || this.visited.has(node)) {
      return super.unwrap(node);
    }

    const { path, schema } = getNodeMetadata(node);
    if (isRefNode(schema)) {
      this.populateTreeFragment(node, pointerToPath(schema.$ref)); // DO NOTE THAT NODES PLACED UNDER THE REF MAY NOT HAVE CORRECT PATHS
    } else {
      this.populateTreeFragment(node, path);
    }

    this.visited.add(node);
    return super.unwrap(node);
  }
}

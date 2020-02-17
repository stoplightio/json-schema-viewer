import { isLocalRef, pointerToPath } from '@stoplight/json';
import { Tree, TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { get as _get } from 'lodash-es';
import { SchemaNode } from '../types';
import { isRefNode } from '../utils/guards';
import { getNodeMetadata, metadataStore } from './metadata';
import { populateTree } from './populateTree';

export type SchemaTreeOptions = {
  expandedDepth: number;
  mergeAllOf: boolean;
};

export { TreeState as SchemaTreeState }

export class SchemaTree extends Tree {
  public expandedDepth: number;
  public mergeAllOf: boolean;

  constructor(public schema: JSONSchema4, public state: TreeState, opts: SchemaTreeOptions) {
    super();

    this.expandedDepth = opts.expandedDepth;
    this.mergeAllOf = opts.mergeAllOf;
  }

  protected readonly visited = new WeakSet();

  public populate() {
    const expanded = {};
    populateTree(this.schema, this.root, 0, [], {
      mergeAllOf: this.mergeAllOf,
      onNode: (node: SchemaNode, parentTreeNode, level: number): boolean => {
        if (isRefNode(node) && isLocalRef(node.$ref)) {
          expanded[node.id] = false;
        }

        const metadata = metadataStore.get(parentTreeNode);

        if (metadata !== void 0 && isRefNode(metadata.schemaNode)) return false;
        return level <= this.expandedDepth + 1;
      },
    });
    this.state.expanded = expanded;
    this.invalidate();
  }

  public populateTreeFragment(parent: TreeListParentNode, schema: JSONSchema4, path: JsonPath) {
    const initialLevel = Tree.getLevel(parent);
    const artificialRoot = Tree.createArtificialRoot();
    populateTree(schema, artificialRoot, initialLevel, path, {
      mergeAllOf: this.mergeAllOf,
      onNode: (node: SchemaNode, parentTreeNode, level: number) => level <= initialLevel + 1,
    });
    this.insertTreeFragment((artificialRoot.children[0] as TreeListParentNode).children, parent);
  }

  public unwrap(node: TreeListParentNode) {
    if (node.children.length !== 0 || this.visited.has(node)) {
      return super.unwrap(node);
    }

    const { path, schemaNode, schema } = getNodeMetadata(node);
    if (isRefNode(schemaNode)) {
      const refPath = pointerToPath(schemaNode.$ref);
      this.populateTreeFragment(node, _get(this.schema, refPath), refPath); // DO NOTE THAT NODES PLACED UNDER THE REF MAY NOT HAVE CORRECT PATHS
    } else {
      this.populateTreeFragment(node, schema, path);
    }

    this.visited.add(node);
    return super.unwrap(node);
  }
}

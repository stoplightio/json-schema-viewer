import { isLocalRef, pointerToPath } from '@stoplight/json';
import { Tree, TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { JsonPath } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { get as _get, isEqual as _isEqual } from 'lodash';
import { isRefNode } from '../utils/guards';
import { getNodeMetadata, metadataStore } from './metadata';
import { populateTree } from './populateTree';

export type SchemaTreeOptions = {
  expandedDepth: number;
  mergeAllOf: boolean;
};

export { TreeState as SchemaTreeState };

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
      onNode: (node, parentTreeNode, level): boolean => {
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
      onNode: (node, parentTreeNode, level) => level <= this.expandedDepth + 1 || level <= initialLevel + 1,
    });

    if (artificialRoot.children.length === 0) {
      throw new Error(`Could not expand node ${path.join('.')}`);
    }

    // todo: improve walk, i.e. add stepIn so that this is not required
    if (
      'children' in artificialRoot.children[0] &&
      _isEqual(getNodeMetadata(parent).path, getNodeMetadata(artificialRoot.children[0]).path)
    ) {
      this.insertTreeFragment(artificialRoot.children[0].children, parent);
    } else {
      this.insertTreeFragment(artificialRoot.children, parent);
    }
  }

  public unwrap(node: TreeListParentNode) {
    if (node.children.length !== 0 || this.visited.has(node)) {
      return super.unwrap(node);
    }

    const metadata = getNodeMetadata(node);
    const { path, schemaNode, schema } = metadata;
    if (isRefNode(schemaNode)) {
      const refPath = pointerToPath(schemaNode.$ref);
      const schemaFragment = _get(this.schema, refPath);
      this.populateTreeFragment(node, schemaFragment, path);
      metadata.schema = schemaFragment;
    } else {
      this.populateTreeFragment(node, schema, path);
    }

    this.visited.add(node);
    return super.unwrap(node);
  }
}

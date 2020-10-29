import { extractPointerFromRef, extractSourceFromRef, pointerToPath } from '@stoplight/json';
import { Tree, TreeListParentNode, TreeState } from '@stoplight/tree-list';
import { JsonPath, Optional } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { get as _get, isEqual as _isEqual, isObject as _isObject } from 'lodash';
import { ResolvingError } from '../errors';
import { ViewContext } from '../types';
import { hasRefItems, isRefNode } from '../utils/guards';
import { getSchemaNodeMetadata } from './metadata';
import { canStepIn } from './utils/canStepIn';
import { createErrorTreeNode } from './utils/createErrorTreeNode';
import { populateTree, WalkerRefResolver } from './utils/populateTree';

export type SchemaTreeRefInfo = {
  source: string | null;
  pointer: string | null;
};

export type SchemaTreeRefDereferenceFn = (
  ref: SchemaTreeRefInfo,
  propertyPath: JsonPath | null,
  schema: JSONSchema4,
) => Optional<JSONSchema4>;

export type SchemaTreePopulateHandler = (tree: SchemaTree, node: TreeListParentNode) => void;

export type SchemaTreeOptions = {
  expandedDepth: number;
  mergeAllOf: boolean;
  resolveRef: Optional<SchemaTreeRefDereferenceFn>;
  shouldResolveEagerly: boolean;
  onPopulate: Optional<SchemaTreePopulateHandler>;
  context?: ViewContext;
};

export { TreeState as SchemaTreeState };

export class SchemaTree extends Tree {
  public treeOptions: SchemaTreeOptions;

  constructor(public schema: JSONSchema4, public state: TreeState, opts: SchemaTreeOptions) {
    super({
      expanded: node =>
        (!(node.id in state.expanded) && SchemaTree.getLevel(node) <= opts.expandedDepth) ||
        state.expanded[node.id] === true,
    });

    this.treeOptions = opts;
  }

  protected readonly visited = new WeakSet();

  public populate() {
    const expanded = {};
    populateTree(this.schema, this.root, 0, [], {
      mergeAllOf: this.treeOptions.mergeAllOf,
      onNode: (fragment, node, parentTreeNode, level): boolean => {
        if (
          !!fragment.writeOnly !== !!fragment.readOnly &&
          ((this.treeOptions.context === 'read' && fragment.writeOnly) ||
            (this.treeOptions.context === 'write' && fragment.readOnly))
        ) {
          return false;
        }
        if (
          !this.treeOptions.shouldResolveEagerly &&
          ((isRefNode(node) && node.$ref !== null) || (hasRefItems(node) && node.items.$ref !== null))
        ) {
          expanded[node.id] = false;
        }

        const metadata = Tree.getLevel(parentTreeNode) >= 0 ? getSchemaNodeMetadata(parentTreeNode) : void 0;

        if (metadata !== void 0 && isRefNode(metadata.schemaNode)) return false;
        return level <= this.treeOptions.expandedDepth + 1;
      },
      resolveRef: this.resolveRef,
      shouldResolveEagerly: this.treeOptions.shouldResolveEagerly,
    });
    this.state.expanded = expanded;
    this.invalidate();
    this.treeOptions.onPopulate?.(this, this.root);
  }

  public populateTreeFragment(parent: TreeListParentNode, schema: JSONSchema4, path: JsonPath, stepIn: boolean) {
    const initialLevel = Tree.getLevel(parent);
    const artificialRoot = Tree.createArtificialRoot();
    populateTree(schema, artificialRoot, initialLevel, path, {
      mergeAllOf: this.treeOptions.mergeAllOf,
      onNode: (fragment, node, parentTreeNode, level) => {
        if (level <= this.treeOptions.expandedDepth || level <= initialLevel) return true;
        return stepIn && level <= initialLevel + 1 && canStepIn(getSchemaNodeMetadata(parentTreeNode).schema);
      },
      resolveRef: this.resolveRef,
      shouldResolveEagerly: this.treeOptions.shouldResolveEagerly,
    });

    if (artificialRoot.children.length === 0) {
      throw new Error(`Could not expand node ${path.join('.')}`);
    }

    this.insertTreeFragment(stepIn ? this.stepIn(artificialRoot, parent) : artificialRoot.children, parent);

    this.treeOptions.onPopulate?.(this, parent);
  }

  protected insertErrorNode(parent: TreeListParentNode, error: string) {
    this.insertNode(createErrorTreeNode(parent, error), parent);
  }

  protected stepIn(root: TreeListParentNode, parent: TreeListParentNode) {
    if (
      root.children.length > 0 &&
      'children' in root.children[0] &&
      _isEqual(getSchemaNodeMetadata(parent).path, getSchemaNodeMetadata(root.children[0]).path)
    ) {
      return root.children[0].children;
    }

    return root.children;
  }

  public unwrap(node: TreeListParentNode) {
    if (node.children.length !== 0 || this.visited.has(node)) {
      return super.unwrap(node);
    }
    const metadata = getSchemaNodeMetadata(node);
    const { path, schemaNode, schema } = metadata;
    try {
      if (!isRefNode(schemaNode) && !hasRefItems(schemaNode)) {
        this.populateTreeFragment(node, schema, path, true);
      } else if (isRefNode(schemaNode)) {
        this.populateRefFragment(node, path, schemaNode.$ref);
      } else if (hasRefItems(schemaNode)) {
        this.populateRefFragment(node, [...path, 'items'], schemaNode.items.$ref);
      } else {
        throw new Error(`I do know not how to expand this node ${path.join('.')}`);
      }
    } catch (ex) {
      this.insertErrorNode(node, ex.message);
    }

    this.visited.add(node);
    return super.unwrap(node);
  }

  protected resolveRef: WalkerRefResolver = (path, $ref) => {
    const source = extractSourceFromRef($ref);
    const pointer = extractPointerFromRef($ref);

    if (this.treeOptions.resolveRef !== void 0) {
      return this.treeOptions.resolveRef({ source, pointer }, path, this.schema);
    } else if (source !== null) {
      throw new ResolvingError('Cannot dereference external references');
    } else if (pointer === null) {
      throw new ResolvingError('The pointer is empty');
    } else {
      return _get(this.schema, pointerToPath(pointer));
    }
  };

  protected populateRefFragment(node: TreeListParentNode, path: JsonPath, $ref: string | null) {
    if ($ref === null) {
      throw new Error('Unknown $ref value');
    }

    const schemaFragment = this.resolveRef(path, $ref);

    if (!_isObject(schemaFragment)) {
      throw new ResolvingError(`Could not dereference "${$ref}"`);
    }

    this.populateTreeFragment(node, schemaFragment, path, false);
  }
}

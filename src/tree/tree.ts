import {
  isMirroredNode,
  isReferenceNode,
  isRegularNode,
  MirroredSchemaNode,
  RegularNode,
  RootNode,
  SchemaNode,
  SchemaNodeKind,
  SchemaTree as JsonSchemaTree,
} from '@stoplight/json-schema-tree';
import {
  assertNode as assertTreeNode,
  assertParentNode as assertParentTreeNode,
  isParentNode as isParentTreeNode,
  Tree as TreeListTree,
  TreeFragment,
  TreeListNode,
  TreeListParentNode,
  TreeState,
  TreeStore,
} from '@stoplight/tree-list';
import type { JSONSchema4 } from 'json-schema';

import { isNonNullable } from '../guards/isNonNullable';
import type { SchemaTreeListNode } from '../types';
import { FlattenableNode, SchemaTreeOptions } from './types';

export { TreeState as SchemaTreeState };

export class SchemaTreeListTree extends TreeListTree {
  public treeOptions: SchemaTreeOptions;

  public jsonSchemaTree!: JsonSchemaTree;
  private _schemaToTreeMap!: WeakMap<SchemaNode, SchemaTreeListNode>;
  private _treeToSchemaMap!: WeakMap<SchemaTreeListNode, SchemaNode>;
  private _flattenedSchemaNodes!: WeakSet<RegularNode>;

  constructor(public schema: JSONSchema4, public state: TreeState, opts: SchemaTreeOptions) {
    super({
      expanded: node => TreeStore.isNodeExpanded(node, state.expanded, opts.expandedDepth),
    });

    this.treeOptions = opts;
    this.newSchemaTree();
  }

  protected readonly visited = new WeakSet();

  protected newSchemaTree() {
    this.jsonSchemaTree = new JsonSchemaTree(this.schema, {
      mergeAllOf: this.treeOptions.mergeAllOf,
      refResolver: this.treeOptions.resolveRef,
    });
    this._schemaToTreeMap = new WeakMap();
    this._treeToSchemaMap = new WeakMap();
    this._flattenedSchemaNodes = new WeakSet();
    this._schemaToTreeMap.set(this.jsonSchemaTree.root, this.root);
    this._treeToSchemaMap.set(this.root, this.jsonSchemaTree.root);
  }

  protected static transitionNodeIfNeeded(node: TreeListNode): TreeListParentNode {
    if (!isParentTreeNode(node)) {
      (node as TreeListParentNode).children = [];
      return node as TreeListParentNode;
    }

    return node;
  }

  public unwrap(node: TreeListParentNode<SchemaTreeListNode> & SchemaTreeListNode) {
    if (this.visited.has(node)) {
      for (const child of node.children) {
        if (this.visited.has(child)) continue;
        const schemaNode = this.getFromTreeToSchemaMap(child);
        if (isRegularNode(schemaNode) && !schemaNode.simple && !isParentTreeNode(child)) {
          this.visited.add(SchemaTreeListTree.transitionNodeIfNeeded(child));
        }

        if (isParentTreeNode(child)) {
          this.populateTreeFragment(child);
        }
      }

      return super.unwrap(node);
    }

    this.populateTreeFragment(node);
    this.visited.add(node);
    return super.unwrap(node);
  }

  public populate() {
    this.newSchemaTree();

    this.state.expanded = {};

    if (this.treeOptions.viewMode === 'read' || this.treeOptions.viewMode === 'write') {
      this.jsonSchemaTree.walker.hookInto('filter', node => {
        if (!isRegularNode(node)) return true;

        const { validations } = node;

        if (!!validations.writeOnly === !!validations.readOnly) {
          return true;
        }

        return !(
          (this.treeOptions.viewMode === 'read' && !!validations.writeOnly) ||
          (this.treeOptions.viewMode === 'write' && !!validations.readOnly)
        );
      });
    }

    this._schemaToTreeMap.set(this.jsonSchemaTree.root, this.root);

    this.populateTreeFragment(this.root as any);
    this.invalidate();
  }

  protected createTreeNode(schemaNode: SchemaNode): TreeListNode {
    const parentTreeNode = schemaNode.parent === null ? null : this.getFromSchemaToTreeMap(schemaNode.parent);
    if (parentTreeNode !== null) {
      assertParentTreeNode(parentTreeNode);
    }

    const treeNode: TreeListNode = {
      id: schemaNode.id,
      parent: parentTreeNode,
      name: '',
      metadata: schemaNode,
      ...('children' in schemaNode && isNonNullable(schemaNode.children) && { children: [] }),
    };

    if (isParentTreeNode(treeNode.parent)) {
      this.visited.add(treeNode.parent);
    }

    this._schemaToTreeMap.set(schemaNode, treeNode);
    this._treeToSchemaMap.set(treeNode, schemaNode);

    return treeNode;
  }

  public buildTreeFragment(schemaNode: SchemaNode) {
    const treeNode = this.createTreeNode(schemaNode);

    if (canBeFlattened(schemaNode)) {
      this._flattenedSchemaNodes.add(schemaNode);

      if (
        schemaNode.children === null ||
        isReferenceNode(schemaNode.children[0]) ||
        (isRegularNode(schemaNode.children[0]) && schemaNode.children[0].simple)
      ) {
        // @ts-ignore
        delete treeNode.children;
        return treeNode;
      } else if (isNonNullable(schemaNode.children[0].children)) {
        assertParentTreeNode(treeNode);

        for (const child of schemaNode.children[0].children) {
          this._schemaToTreeMap.set(child.parent!, treeNode);

          if (isMirroredNode(child)) {
            this.state.expanded[child.id] = false;
            treeNode.children.push(this.createTreeNode(child));
          } else {
            treeNode.children.push(this.buildTreeFragment(child));
          }
        }
      }
    } else if (isMirroredNode(schemaNode)) {
      if (isReferenceNode(schemaNode)) {
        return treeNode;
      } else if (isNonNullable(schemaNode.children)) {
        assertParentTreeNode(treeNode);

        for (const child of schemaNode.children) {
          if (isReferenceNode(child) || (isRegularNode(child) && child.children !== null)) {
            this.state.expanded[child.id] = false;
          }

          treeNode.children.push(this.createTreeNode(child));
        }
      }
    } else if ((schemaNode instanceof RootNode || isRegularNode(schemaNode)) && isNonNullable(schemaNode.children)) {
      assertParentTreeNode(treeNode);
      for (const child of schemaNode.children) {
        treeNode.children.push(this.buildTreeFragment(child));
      }
    }

    return treeNode;
  }

  protected unrollSchemaTree(node: RegularNode | RootNode) {
    if (!(node instanceof RootNode)) {
      this.jsonSchemaTree.walker.restoreWalkerAtNode(node);
    }

    const initialDepth =
      (this.jsonSchemaTree.walker.depth === -1 ? this.treeOptions.expandedDepth : this.jsonSchemaTree.walker.depth) + 1;

    this.jsonSchemaTree.walker.hookInto('stepIn', schemaNode => {
      const currentDepth = this.jsonSchemaTree.walker.depth;

      if (currentDepth <= initialDepth) {
        return true;
      }

      if (!isRegularNode(schemaNode) || schemaNode.simple) {
        return false;
      }

      return (
        currentDepth <= initialDepth + 2 &&
        (!schemaNode.simple ||
          (schemaNode.parent !== null &&
            isRegularNode(schemaNode.parent) &&
            schemaNode.parent.primaryType === SchemaNodeKind.Array))
      );
    });

    this.jsonSchemaTree.populate();
    if (
      isRegularNode(node) &&
      !isMirroredNode(node) &&
      isNonNullable(node.children) &&
      node.children.length === 1 &&
      node.children[0].fragment === node.fragment
    ) {
      // @ts-ignore
      node.children = node.children[0].children;
      if (isNonNullable(node.children)) {
        for (const child of node.children) {
          // @ts-ignore
          child.parent = node;
        }
      }
    }
  }

  public populateTreeFragment(parent: SchemaTreeListNode & TreeListParentNode) {
    let schemaNode = this.getFromTreeToSchemaMap(parent);
    let fragment: TreeFragment = [];

    if (isMirroredNode(schemaNode) && isRegularNode(schemaNode) && schemaNode.children === void 0) {
      // if actual fragment has not processed yet, we need to process it first
      this.unrollSchemaTree(schemaNode.mirroredNode as RegularNode);
    }

    const flattened = isRegularNode(schemaNode) && this.isFlattenedNode(schemaNode);
    if (!flattened) {
      if (!isMirroredNode(schemaNode)) {
        this.unrollSchemaTree(schemaNode);
      }

      const frag = this.buildTreeFragment(schemaNode);
      if (isParentTreeNode(frag)) {
        fragment = frag.children;
      }
    } else if (
      isNonNullable(schemaNode.children) &&
      schemaNode.children.length > 0 &&
      isRegularNode(schemaNode.children[0])
    ) {
      fragment = [];
      this.unrollSchemaTree(schemaNode.children[0]);

      if (isNonNullable(schemaNode.children[0].children) && schemaNode.children[0].children.length > 0) {
        for (const child of schemaNode.children[0].children) {
          this._schemaToTreeMap.set(child.parent!, parent);
          fragment.push(this.buildTreeFragment(child));
        }
      }
    }

    if (!isNonNullable(schemaNode.children) || schemaNode.children.length === 0) {
      // @ts-ignore
      delete parent.children;
      return;
    }

    this.insertTreeFragment(fragment, parent);
  }

  public isFlattenedNode(node: RegularNode) {
    return this._flattenedSchemaNodes.has(node);
  }

  public getFromSchemaToTreeMap(schemaNode: RegularNode | RootNode | MirroredSchemaNode): SchemaTreeListNode {
    const treeNode = this._schemaToTreeMap.get(schemaNode);
    assertTreeNode(treeNode);
    return treeNode;
  }

  public getFromTreeToSchemaMap(treeNode: SchemaTreeListNode): RegularNode | RootNode {
    const schemaNode = treeNode?.metadata?.schemaNode;

    if (schemaNode === void 0) {
      throw new ReferenceError('Could not find any schemaNode for given treeNode');
    }

    if (!isRegularNode(schemaNode) && !(schemaNode instanceof RootNode)) {
      throw new TypeError('Invalid schema node');
    }

    return schemaNode;
  }
}

function canBeFlattened(node: SchemaNode): node is FlattenableNode {
  if (!isRegularNode(node)) return false;

  if (node.primaryType !== SchemaNodeKind.Array || !isNonNullable(node.children) || node.children.length === 0) {
    return false;
  }

  return (
    node.children.length === 1 &&
    (isRegularNode(node.children[0]) || (isReferenceNode(node.children[0]) && node.children[0].error !== null))
  );
}

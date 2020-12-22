import type { SchemaTreeRefDereferenceFn } from '@stoplight/json-schema-tree';
import { isRegularNode } from '@stoplight/json-schema-tree';
import { ErrorBoundaryForwardedProps, FallbackComponent, withErrorBoundary } from '@stoplight/react-error-boundary';
import { Tree, TreeState, TreeStore } from '@stoplight/tree-list';
import cn from 'classnames';
import type { JSONSchema4 } from 'json-schema';
import { action } from 'mobx';
import * as React from 'react';

import { SchemaTreeContext, ViewModeContext } from '../contexts';
import { SchemaTreeListTree, SchemaTreeOptions } from '../tree';
import type { GoToRefHandler, RowRenderer, ViewMode } from '../types';
import { SchemaTree as SchemaTreeComponent } from './SchemaTree';

export interface IJsonSchemaViewer {
  schema: JSONSchema4;
  emptyText?: string;
  defaultExpandedDepth?: number;
  expanded?: boolean;
  className?: string;
  maxRows?: number;
  onGoToRef?: GoToRefHandler;
  mergeAllOf?: boolean;
  FallbackComponent?: typeof FallbackComponent;
  rowRenderer?: RowRenderer;
  resolveRef?: SchemaTreeRefDereferenceFn;
  viewMode?: ViewMode;
}

export class JsonSchemaViewerComponent extends React.PureComponent<
  IJsonSchemaViewer & ErrorBoundaryForwardedProps,
  { isEmpty: boolean }
> {
  protected readonly treeStore: TreeStore;
  protected readonly tree: SchemaTreeListTree;
  protected readonly treeState: TreeState;

  public readonly state = {
    isEmpty: true,
  };

  constructor(props: IJsonSchemaViewer & ErrorBoundaryForwardedProps) {
    super(props);

    this.treeState = new TreeState();
    this.tree = new SchemaTreeListTree(props.schema, this.treeState, this.treeOptions);
    this.treeStore = new TreeStore(this.tree, this.treeState, {
      defaultExpandedDepth: this.expandedDepth,
    });
  }

  protected get treeOptions(): SchemaTreeOptions {
    return {
      expandedDepth: this.expandedDepth,
      mergeAllOf: this.mergeAllOf,
      resolveRef: this.props.resolveRef,
      viewMode: this.props.viewMode,
    };
  }

  protected get mergeAllOf() {
    return this.props.mergeAllOf !== false;
  }

  protected get expandedDepth(): number {
    if (this.props.expanded) {
      return Infinity; // tree-list kind of equivalent of expanded: all
    }

    if (this.props.defaultExpandedDepth !== void 0) {
      return this.props.defaultExpandedDepth;
    }

    return 1;
  }

  protected renderSchema() {
    if (this.tree.count > 0) {
      this.tree.setRoot(Tree.createArtificialRoot());
    }

    this.tree.populate();
    this.setState({
      isEmpty: this.tree.jsonSchemaTree.root.children.every(node => !isRegularNode(node) || node.unknown),
    });
  }

  public componentDidMount() {
    this.renderSchema();
  }

  @action
  public componentDidUpdate(prevProps: Readonly<IJsonSchemaViewer>) {
    if (prevProps.resolveRef !== this.props.resolveRef) {
      this.tree.treeOptions.resolveRef = this.props.resolveRef;
    }

    if (
      this.treeStore.defaultExpandedDepth !== this.expandedDepth ||
      prevProps.schema !== this.props.schema ||
      prevProps.mergeAllOf !== this.props.mergeAllOf ||
      prevProps.viewMode !== this.props.viewMode
    ) {
      this.treeStore.defaultExpandedDepth = this.expandedDepth;
      this.tree.treeOptions = this.treeOptions;
      this.tree.schema = this.props.schema;
      this.renderSchema();
    }
  }

  public render() {
    const {
      props: { emptyText = 'No schema defined', schema, expanded, defaultExpandedDepth, className, ...props },
    } = this;

    if (this.state.isEmpty) {
      return <div>{emptyText}</div>;
    }

    return (
      <div className={cn(className, 'JsonSchemaViewer flex flex-col relative')}>
        <SchemaTreeContext.Provider value={this.tree}>
          <ViewModeContext.Provider value={this.props.viewMode ?? 'standalone'}>
            <SchemaTreeComponent expanded={expanded} schema={schema} treeStore={this.treeStore} {...props} />
          </ViewModeContext.Provider>
        </SchemaTreeContext.Provider>
      </div>
    );
  }
}

const JsonSchemaFallbackComponent: typeof FallbackComponent = ({ error }) => {
  return (
    <div className="p-4">
      <b className="text-danger">Error</b>
      {error !== null ? `: ${error.message}` : null}
    </div>
  );
};

export const JsonSchemaViewer = withErrorBoundary<IJsonSchemaViewer>(JsonSchemaViewerComponent, {
  FallbackComponent: JsonSchemaFallbackComponent,
  recoverableProps: ['schema'],
  reportErrors: false,
});

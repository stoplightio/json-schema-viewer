import { ErrorBoundaryForwardedProps, FallbackComponent, withErrorBoundary } from '@stoplight/react-error-boundary';
import { Tree, TreeState, TreeStore } from '@stoplight/tree-list';
import cn from 'classnames';
import { action } from 'mobx';
import * as React from 'react';

import { JSONSchema4 } from 'json-schema';
import { SchemaTree, SchemaTreeOptions, SchemaTreePopulateHandler, SchemaTreeRefDereferenceFn } from '../tree/tree';
import { GoToRefHandler, RowRenderer, ViewMode } from '../types';
import { isSchemaViewerEmpty } from '../utils/isSchemaViewerEmpty';
import { SchemaTree as SchemaTreeComponent } from './SchemaTree';

export interface IJsonSchemaViewer {
  schema: JSONSchema4;
  style?: object;
  emptyText?: string;
  defaultExpandedDepth?: number;
  expanded?: boolean;
  className?: string;
  name?: string;
  hideTopBar?: boolean;
  maxRows?: number;
  onGoToRef?: GoToRefHandler;
  mergeAllOf?: boolean;
  FallbackComponent?: typeof FallbackComponent;
  rowRenderer?: RowRenderer;
  onTreePopulate?: SchemaTreePopulateHandler;
  resolveRef?: SchemaTreeRefDereferenceFn;
  shouldResolveEagerly?: boolean;
  viewMode?: ViewMode;
}

export const ViewModeContext = React.createContext<ViewMode>('standalone');
ViewModeContext.displayName = 'ViewModeContext';

export class JsonSchemaViewerComponent extends React.PureComponent<IJsonSchemaViewer & ErrorBoundaryForwardedProps> {
  protected readonly treeStore: TreeStore;
  protected readonly tree: SchemaTree;
  protected readonly treeState: TreeState;

  constructor(props: IJsonSchemaViewer & ErrorBoundaryForwardedProps) {
    super(props);

    this.treeState = new TreeState();
    this.tree = new SchemaTree(props.schema, this.treeState, this.treeOptions);
    this.treeStore = new TreeStore(this.tree, this.treeState, {
      defaultExpandedDepth: this.expandedDepth,
    });
  }

  protected get treeOptions(): SchemaTreeOptions {
    return {
      expandedDepth: this.expandedDepth,
      mergeAllOf: this.mergeAllOf,
      resolveRef: this.props.resolveRef,
      shouldResolveEagerly: !!this.props.shouldResolveEagerly,
      onPopulate: this.props.onTreePopulate,
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

    if (this.props.defaultExpandedDepth !== undefined) {
      return this.props.defaultExpandedDepth;
    }

    return 1;
  }

  protected renderSchema() {
    if (this.tree.count > 0) {
      this.tree.setRoot(Tree.createArtificialRoot());
    }

    this.tree.populate();
  }

  public componentDidMount() {
    this.renderSchema();
  }

  @action
  public componentDidUpdate(prevProps: Readonly<IJsonSchemaViewer>) {
    if (prevProps.resolveRef !== this.props.resolveRef) {
      this.tree.treeOptions.resolveRef = this.props.resolveRef;
    }

    if (prevProps.onTreePopulate !== this.props.onTreePopulate) {
      this.tree.treeOptions.onPopulate = this.props.onTreePopulate;
    }

    if (
      this.treeStore.defaultExpandedDepth !== this.expandedDepth ||
      prevProps.schema !== this.props.schema ||
      prevProps.mergeAllOf !== this.props.mergeAllOf ||
      prevProps.shouldResolveEagerly !== this.props.shouldResolveEagerly ||
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
      props: { emptyText = 'No schema defined', name, schema, expanded, defaultExpandedDepth, className, ...props },
    } = this;

    // an empty array or object is still a valid response, schema is ONLY really empty when a combiner type has no information
    if (isSchemaViewerEmpty(schema)) {
      return <div>{emptyText}</div>;
    }

    return (
      <div className={cn(className, 'JsonSchemaViewer flex flex-col relative')}>
        <ViewModeContext.Provider value={this.props.viewMode ?? 'standalone'}>
          <SchemaTreeComponent expanded={expanded} name={name} schema={schema} treeStore={this.treeStore} {...props} />
        </ViewModeContext.Provider>
      </div>
    );
  }
}

const JsonSchemaFallbackComponent: typeof FallbackComponent = ({ error }) => {
  return (
    <div className="p-4">
      <b className="text-danger">Error</b>
      {error && `: ${error.message}`}
    </div>
  );
};

export const JsonSchemaViewer = withErrorBoundary<IJsonSchemaViewer>(JsonSchemaViewerComponent, {
  FallbackComponent: JsonSchemaFallbackComponent,
  recoverableProps: ['schema'],
  reportErrors: false,
});

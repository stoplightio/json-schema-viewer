import { ErrorBoundaryForwardedProps, FallbackComponent, withErrorBoundary } from '@stoplight/react-error-boundary';
import { TreeState, TreeStore } from '@stoplight/tree-list';
import cn from 'classnames';
import { action } from 'mobx';
import * as React from 'react';

import { JSONSchema4 } from 'json-schema';
import { SchemaTree } from '../tree/tree';
import { GoToRefHandler, RowRenderer } from '../types';
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
}

export class JsonSchemaViewerComponent extends React.PureComponent<IJsonSchemaViewer & ErrorBoundaryForwardedProps> {
  protected readonly treeStore: TreeStore;
  protected readonly tree: SchemaTree;
  protected readonly treeState: TreeState;

  constructor(props: IJsonSchemaViewer & ErrorBoundaryForwardedProps) {
    super(props);

    this.treeState = new TreeState();
    this.tree = new SchemaTree(props.schema, this.treeState, {
      expandedDepth: this.expandedDepth,
      mergeAllOf: this.mergeAllOf,
    });
    this.treeStore = new TreeStore(this.tree, this.treeState, {
      defaultExpandedDepth: this.expandedDepth,
    });
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
    if (this.tree.count > 1) {
      for (const child of this.tree) {
        this.tree.removeNode(child);
      }
    }

    this.tree.populate();
  }

  public componentDidMount() {
    this.renderSchema();
  }

  @action
  public componentDidUpdate(prevProps: Readonly<IJsonSchemaViewer>) {
    if (this.treeStore.defaultExpandedDepth !== this.expandedDepth) {
      this.treeStore.defaultExpandedDepth = this.expandedDepth;
      this.tree.expandedDepth = this.expandedDepth;
      this.renderSchema();
    } else if (prevProps.schema !== this.props.schema || prevProps.mergeAllOf !== this.props.mergeAllOf) {
      this.tree.mergeAllOf = this.mergeAllOf;
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
      <div className={cn(className, 'JsonSchemaViewer flex flex-col h-full w-full relative')}>
        <SchemaTreeComponent expanded={expanded} name={name} schema={schema} treeStore={this.treeStore} {...props} />
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

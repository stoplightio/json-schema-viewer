import { ErrorBoundaryForwardedProps, FallbackComponent, withErrorBoundary } from '@stoplight/react-error-boundary';
import { TreeState, TreeStore } from '@stoplight/tree-list';
import { Intent, Spinner } from '@stoplight/ui-kit';
import cn from 'classnames';
import { action, runInAction } from 'mobx';
import * as React from 'react';

import { JSONSchema4 } from 'json-schema';
import { SchemaTree } from '../tree/tree';
import { GoToRefHandler, RowRenderer } from '../types';
import { isSchemaViewerEmpty } from '../utils/isSchemaViewerEmpty';
import { SchemaTree as SchemaTreeComponent } from './SchemaTree';

export interface IJsonSchemaViewer {
  schema: JSONSchema4;
  dereferencedSchema?: JSONSchema4;
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

  public state = {
    computing: false,
  };

  constructor(props: IJsonSchemaViewer & ErrorBoundaryForwardedProps) {
    super(props);

    this.treeState = new TreeState();
    this.tree = new SchemaTree(this.schema, this.treeState, this.expandedDepth);
    this.treeStore = new TreeStore(this.tree, this.treeState, {
      defaultExpandedDepth: this.expandedDepth,
    });
  }

  protected get expandedDepth(): number {
    if (this.props.expanded) {
      return 2 ** 31 - 3; // tree-list kind of equivalent of expanded: all
    }

    if (this.props.defaultExpandedDepth !== undefined) {
      return this.props.defaultExpandedDepth;
    }

    return 1;
  }

  protected get schema() {
    return this.props.dereferencedSchema || this.props.schema;
  }

  protected renderSchema() {
    this.tree.populate();
  }

  public componentDidMount() {
    this.renderSchema();
  }

  @action
  public componentDidUpdate(prevProps: Readonly<IJsonSchemaViewer>) {
    if (this.treeStore.defaultExpandedDepth !== this.expandedDepth) {
      runInAction(() => {
        this.treeStore.defaultExpandedDepth = this.expandedDepth;
      });
    }

    if (
      prevProps.schema !== this.props.schema ||
      prevProps.dereferencedSchema !== this.props.dereferencedSchema ||
      prevProps.mergeAllOf !== this.props.mergeAllOf
    ) {
      // todo: this doesn't work yet
      this.renderSchema();
    }
  }

  public render() {
    const {
      props: { emptyText = 'No schema defined', name, schema, expanded, defaultExpandedDepth, className, ...props },
      state: { computing },
    } = this;

    // an empty array or object is still a valid response, schema is ONLY really empty when a combiner type has no information
    if (isSchemaViewerEmpty(schema)) {
      return <div>{emptyText}</div>;
    }

    return (
      <div className={cn(className, 'JsonSchemaViewer flex flex-col h-full w-full relative')}>
        {computing && (
          <div className="flex justify-center items-center absolute w-full h-full left-0 top-0">
            <div className="absolute w-full h-full left-0 top-0 opacity-25 bg-gray-2 dark:bg-gray-6" />
            <Spinner className="relative" intent={Intent.PRIMARY} size={Spinner.SIZE_LARGE} />
          </div>
        )}
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
  recoverableProps: ['schema', 'dereferencedSchema'],
  reportErrors: false,
});

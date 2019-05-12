import { TreeStore } from '@stoplight/tree-list';
import { Omit } from '@stoplight/types';
import { runInAction } from 'mobx';
import * as React from 'react';
import ErrorBoundary, { ErrorBoundaryProps, FallbackProps } from 'react-error-boundary';

import { isSchemaViewerEmpty, renderSchema } from '../utils';
import { ISchemaTree, SchemaTree } from './SchemaTree';

export interface IJsonSchemaViewer extends ErrorBoundaryProps, Omit<ISchemaTree, 'treeStore'> {
  style?: object;
  emptyText?: string;
  defaultExpandedDepth?: number;
  expanded?: boolean;
}

class JsonSchemaViewerComponent extends React.PureComponent<IJsonSchemaViewer> {
  protected treeStore: TreeStore;

  constructor(props: IJsonSchemaViewer) {
    super(props);

    this.treeStore = new TreeStore({
      defaultExpandedDepth: this.expandedDepth,
      nodes: Array.from(renderSchema(props.dereferencedSchema || props.schema, 0, { path: [] }, { mergeAllOf: true })),
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

  public componentDidUpdate(prevProps: Readonly<IJsonSchemaViewer>) {
    if (this.treeStore.defaultExpandedDepth !== this.expandedDepth) {
      runInAction(() => {
        this.treeStore.defaultExpandedDepth = this.expandedDepth;
      });
    }

    if (prevProps.schema !== this.props.schema || prevProps.dereferencedSchema !== this.props.dereferencedSchema) {
      runInAction(() => {
        this.treeStore.nodes = Array.from(
          renderSchema(this.props.dereferencedSchema || this.props.schema, 0, { path: [] }, { mergeAllOf: true })
        );
      });
    }
  }

  public render() {
    const {
      props: { emptyText = 'No schema defined', name, schema, expanded, defaultExpandedDepth, ...props },
    } = this;

    // an empty array or object is still a valid response, schema is ONLY really empty when a combiner type has no information
    if (isSchemaViewerEmpty(schema)) {
      return <div>{emptyText}</div>;
    }

    return <SchemaTree expanded={expanded} name={name} schema={schema} treeStore={this.treeStore} {...props} />;
  }
}

const JsonSchemaFallbackComponent: React.FunctionComponent<FallbackProps> = ({ error }) => {
  return (
    <div className="p-4">
      <b>Error</b>
      {error && `: ${error.message}`}
    </div>
  );
};

export const JsonSchemaViewer: React.FunctionComponent<IJsonSchemaViewer> = ({
  onError,
  FallbackComponent = JsonSchemaFallbackComponent,
  ...props
}) => {
  return (
    <ErrorBoundary onError={onError} FallbackComponent={FallbackComponent}>
      <JsonSchemaViewerComponent {...props} />
    </ErrorBoundary>
  );
};
JsonSchemaViewer.displayName = 'JsonSchemaViewer';

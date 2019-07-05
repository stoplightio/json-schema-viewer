import { TreeStore } from '@stoplight/tree-list';
import * as cn from 'classnames';
import { runInAction } from 'mobx';
import * as React from 'react';

import { JSONSchema4 } from 'json-schema';
import { GoToRefHandler } from '../types';
import { isSchemaViewerEmpty, renderSchema } from '../utils';
import { SelectedPaths } from './MaskControls';
import { SchemaTree } from './SchemaTree';

export type FallbackComponent = React.ComponentType<{ error: Error | null }>;

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
  maskControlsHandler?: (attrs: SelectedPaths) => string[];
  maskUpdater?: () => React.ReactElement;
  maskProps?: SelectedPaths;
  FallbackComponent?: FallbackComponent;
}

export class JsonSchemaViewerComponent extends React.PureComponent<IJsonSchemaViewer> {
  protected treeStore: TreeStore;

  constructor(props: IJsonSchemaViewer) {
    super(props);

    this.treeStore = new TreeStore({
      defaultExpandedDepth: this.expandedDepth,
      nodes: Array.from(
        renderSchema(
          props.dereferencedSchema || props.schema,
          0,
          { path: [] },
          { mergeAllOf: !props.maskControlsHandler },
        ),
      ),
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
          renderSchema(this.props.dereferencedSchema || this.props.schema, 0, { path: [] }, { mergeAllOf: true }),
        );
      });
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
      <SchemaTree
        className={cn('JsonSchemaViewer', className)}
        expanded={expanded}
        name={name}
        schema={schema}
        treeStore={this.treeStore}
        {...props}
      />
    );
  }
}

const JsonSchemaFallbackComponent: FallbackComponent = ({ error }) => {
  return (
    <div className="p-4">
      <b>Error</b>
      {error && `: ${error.message}`}
    </div>
  );
};

// react-error-boundary does not support recovering, see  https://github.com/bvaughn/react-error-boundary/pull/16/files
export class JsonSchemaViewer extends React.PureComponent<IJsonSchemaViewer, { error: null | Error }> {
  public state = {
    error: null,
  };

  public componentDidUpdate(prevProps: Readonly<IJsonSchemaViewer>) {
    if (
      this.state.error !== null &&
      (prevProps.schema !== this.props.schema || prevProps.dereferencedSchema !== this.props.dereferencedSchema)
    ) {
      this.setState({ error: null });
    }
  }

  // there is no error hook yet, see https://reactjs.org/docs/hooks-faq.html#how-do-lifecycle-methods-correspond-to-hooks
  public static getDerivedStateFromError(error: Error) {
    return { error };
  }

  public render() {
    const { FallbackComponent: Fallback = JsonSchemaFallbackComponent, ...props } = this.props;
    if (this.state.error) {
      return <Fallback error={this.state.error} />;
    }

    return <JsonSchemaViewerComponent {...props} />;
  }
}

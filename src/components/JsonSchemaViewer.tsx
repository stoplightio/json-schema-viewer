import { TreeStore } from '@stoplight/tree-list';
import { Intent, Spinner } from '@stoplight/ui-kit';
import cn from 'classnames';
import { runInAction } from 'mobx';
import * as React from 'react';
import SchemaWorker from 'web-worker:../workers/schema.ts';

import { JSONSchema4 } from 'json-schema';
import { GoToRefHandler, RowRenderer, SchemaTreeListNode } from '../types';
import { isCombiner } from '../utils/isCombiner';
import { isSchemaViewerEmpty } from '../utils/isSchemaViewerEmpty';
import { renderSchema } from '../utils/renderSchema';
import { ComputeSchemaMessage, RenderedSchemaMessage } from '../workers/messages';
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
  mergeAllOf?: boolean;
  FallbackComponent?: FallbackComponent;
  rowRenderer?: RowRenderer;
}

export class JsonSchemaViewerComponent extends React.PureComponent<IJsonSchemaViewer, { computing: boolean }> {
  protected treeStore: TreeStore;
  protected instanceId: string;
  protected schemaWorker?: Worker;

  public state = {
    computing: false,
  };

  constructor(props: IJsonSchemaViewer) {
    super(props);

    this.treeStore = new TreeStore({
      defaultExpandedDepth: this.expandedDepth,
      nodes: [],
    });

    this.instanceId = Math.random().toString(36);
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

  protected handleWorkerMessage = (message: MessageEvent) => {
    if (!message.data || !('instanceId' in message.data) || !('nodes' in message.data)) return;
    const data = message.data as RenderedSchemaMessage;

    if (data.instanceId === this.instanceId) {
      runInAction(() => {
        this.setState({ computing: false });
        this.treeStore.nodes = data.nodes;
      });
    }
  };

  protected prerenderSchema() {
    const schema = this.schema;
    let needsFullRendering = true;
    const renderedSchema = renderSchema(
      schema,
      0,
      { path: [] },
      {
        depth: this.expandedDepth + 1,
      },
    );

    const nodes: SchemaTreeListNode[] = [];

    if (this.props.maxRows !== undefined) {
      let i = this.props.maxRows;
      let hasAllOf = false;
      for (const node of renderedSchema) {
        if (i === 0) break;
        i--;

        if (!hasAllOf && node.metadata && isCombiner(node.metadata) && node.metadata.combiner === 'allOf') {
          hasAllOf = true;
        }

        nodes.push(node);
      }

      needsFullRendering = hasAllOf || this.props.maxRows <= nodes.length;
    } else {
      nodes.push(...Array.from(renderedSchema));
    }

    runInAction(() => {
      this.treeStore.nodes = nodes;
    });

    return needsFullRendering;
  }

  protected renderSchema() {
    const needsFullRendering = this.prerenderSchema();
    if (!needsFullRendering) {
      return;
    }

    const message: ComputeSchemaMessage = {
      instanceId: this.instanceId,
      schema: this.schema,
      mergeAllOf: this.props.mergeAllOf !== false,
    };

    if (this.schemaWorker) {
      this.schemaWorker.postMessage(message);
    }

    this.setState({ computing: true });
  }

  public componentDidMount() {
    this.schemaWorker = new SchemaWorker();
    this.schemaWorker.addEventListener('message', this.handleWorkerMessage);
    this.renderSchema();
  }

  public componentWillUnmount() {
    if (this.schemaWorker !== void 0) {
      this.schemaWorker.terminate();
    }
  }

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
        <SchemaTree expanded={expanded} name={name} schema={schema} treeStore={this.treeStore} {...props} />

        {computing && (
          <div className="flex justify-center items-center absolute w-full h-full left-0 top-0">
            <div className="absolute w-full h-full left-0 top-0 opacity-25 bg-gray-2 dark:bg-gray-6" />
            <Spinner className="z-10 relative" intent={Intent.PRIMARY} size={Spinner.SIZE_LARGE} />
          </div>
        )}
      </div>
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

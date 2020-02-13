import { ErrorBoundaryForwardedProps, FallbackComponent, withErrorBoundary } from '@stoplight/react-error-boundary';
import { Tree, TreeState, TreeStore } from '@stoplight/tree-list';
import { Intent, Spinner } from '@stoplight/ui-kit';
import cn from 'classnames';
import { action, runInAction } from 'mobx';
import * as React from 'react';
import SchemaWorker, { WebWorker } from 'web-worker:../workers/schema.ts';

import { JSONSchema4 } from 'json-schema';
import { populateTree } from '../tree/populateTree';
import { GoToRefHandler, RowRenderer } from '../types';
import { isSchemaViewerEmpty } from '../utils/isSchemaViewerEmpty';
import { ComputeSchemaMessageData, isRenderedSchemaMessage } from '../workers/messages';
import { SchemaTree } from './SchemaTree';

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
  protected readonly tree: Tree;
  protected readonly instanceId: string;
  public static schemaWorker?: WebWorker;

  public state = {
    computing: false,
  };

  constructor(props: IJsonSchemaViewer & ErrorBoundaryForwardedProps) {
    super(props);

    this.tree = new Tree(Tree.createArtificialRoot());
    this.treeStore = new TreeStore(this.tree, new TreeState(), {
      defaultExpandedDepth: this.expandedDepth,
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

  protected handleWorkerMessage = action<(message: MessageEvent) => void>(message => {
    if (!isRenderedSchemaMessage(message)) return;
    const { data } = message;

    if (data.instanceId === this.instanceId) {
      this.setState({ computing: false });
      if (data.error === null) {
        this.tree.insertNode(data.tree, null);
      } else if (this.props.boundaryRef.current !== null) {
        this.props.boundaryRef.current.throwError(new Error(data.error));
      }
    }
  });

  // protected prerenderSchema() {
  //   const schema = this.schema;
  //   const isWorkerSpawn =
  //     JsonSchemaViewerComponent.schemaWorker !== void 0 && !('isShim' in JsonSchemaViewerComponent.schemaWorker);
  //   let needsFullRendering = isWorkerSpawn;
  //
  //   const renderedSchema = generateTree(
  //     schema,
  //     0,
  //     { path: [] },
  //     isWorkerSpawn
  //       ? {
  //           depth: this.expandedDepth + 1,
  //         }
  //       : void 0,
  //   );
  //
  //   const nodes: SchemaTreeListNode[] = [];
  //
  //   if (isWorkerSpawn && this.props.maxRows !== undefined) {
  //     let i = this.props.maxRows;
  //     let hasAllOf = false;
  //     for (const node of renderedSchema) {
  //       if (i === 0) break;
  //       i--;
  //
  //       nodes.push(node);
  //
  //       if (hasAllOf || this.props.mergeAllOf === false || !node.metadata) continue;
  //
  //       hasAllOf =
  //         ((node.metadata as IBaseNode).type === SchemaKind.Array &&
  //           getArraySubtype(node.metadata as IArrayNode) === 'allOf') ||
  //         (node.metadata && isCombinerNode(node.metadata) && node.metadata.combiner === 'allOf');
  //     }
  //
  //     needsFullRendering = hasAllOf || this.props.maxRows <= nodes.length;
  //   } else {
  //     nodes.push(...Array.from(renderedSchema));
  //   }
  //
  //   runInAction(() => {
  //     this.treeStore.nodes = nodes;
  //   });
  //
  //   return needsFullRendering;
  // }

  protected renderSchema() {
    populateTree(this.schema, this.tree.root, 0, [], null);
    this.tree.root = this.tree.root.children[0];
    this.tree.invalidate();
    // const needsFullRendering = true;
    // this.prerenderSchema();
    // if (!needsFullRendering) {
    //   return;
    // }

    const message: ComputeSchemaMessageData = {
      instanceId: this.instanceId,
      schema: this.schema,
      mergeAllOf: this.props.mergeAllOf !== false,
    };

    if (JsonSchemaViewerComponent.schemaWorker !== void 0) {
      JsonSchemaViewerComponent.schemaWorker.postMessage(message);
    }

    this.setState({ computing: false });
  }

  public componentDidMount() {
    // let's initialize it lazily
    if (JsonSchemaViewerComponent.schemaWorker === void 0) {
      JsonSchemaViewerComponent.schemaWorker = new SchemaWorker();
    }

    JsonSchemaViewerComponent.schemaWorker.addEventListener('message', this.handleWorkerMessage);
    this.renderSchema();
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
        {computing && (
          <div className="flex justify-center items-center absolute w-full h-full left-0 top-0">
            <div className="absolute w-full h-full left-0 top-0 opacity-25 bg-gray-2 dark:bg-gray-6" />
            <Spinner className="relative" intent={Intent.PRIMARY} size={Spinner.SIZE_LARGE} />
          </div>
        )}
        <SchemaTree expanded={expanded} name={name} schema={schema} treeStore={this.treeStore} {...props} />
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

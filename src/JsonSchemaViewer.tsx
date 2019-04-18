import { TreeStore } from '@stoplight/tree-list';
import { Omit } from '@stoplight/types';
import { action } from 'mobx';
import * as React from 'react';
import { ErrorMessage } from './components/common/ErrorMessage';
import { MutedText } from './components/common/MutedText';
import { ISchemaView, SchemaView } from './SchemaView';
import { ThemeZone } from './theme';
import { isSchemaViewerEmpty } from './utils/isSchemaViewerEmpty';
import { renderSchema } from './utils/renderSchema';

export interface IJsonSchemaViewer extends Omit<ISchemaView, 'emptyText' | 'treeStore'> {
  emptyText?: string;
  defaultExpandedDepth?: number;
}

export interface IJsonSchemaViewerState {
  error: null | string;
}

export class JsonSchemaViewer extends React.PureComponent<IJsonSchemaViewer, IJsonSchemaViewerState> {
  public state = {
    error: null,
  };

  protected treeStore: TreeStore;

  constructor(props: IJsonSchemaViewer) {
    super(props);

    this.treeStore = new TreeStore({
      defaultExpandedDepth: this.expandedDepth,
      nodes: Array.from(renderSchema(props.schema, props.dereferencedSchema)),
    });
  }

  // there is no error hook yet, see https://reactjs.org/docs/hooks-faq.html#how-do-lifecycle-methods-correspond-to-hooks
  public static getDerivedStateFromError(error: Error): { error: IJsonSchemaViewerState['error'] } {
    return { error: `Error rendering schema. ${error.message}` };
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
      this.setExpandedDepth();
    }

    if (prevProps.schema !== this.props.schema || prevProps.dereferencedSchema !== this.props.dereferencedSchema) {
      this.treeStore.nodes = Array.from(renderSchema(this.props.schema, this.props.dereferencedSchema));
    }
  }

  @action
  protected setExpandedDepth(depth: number = this.expandedDepth) {
    this.treeStore.defaultExpandedDepth = depth;
  }

  public render() {
    const {
      props: { emptyText = 'No schema defined', name, schema, schemas, expanded, defaultExpandedDepth, ...props },
      state: { error },
    } = this;

    if (error) {
      return (
        <ThemeZone name="json-schema-viewer">
          <ErrorMessage>{error}</ErrorMessage>
        </ThemeZone>
      );
    }

    // an empty array or object is still a valid response, schema is ONLY really empty when a combiner type has no information
    if (isSchemaViewerEmpty(schema)) {
      return (
        <ThemeZone name="json-schema-viewer">
          <MutedText>{emptyText}</MutedText>
        </ThemeZone>
      );
    }

    return (
      <ThemeZone name="json-schema-viewer">
        <SchemaView expanded={expanded} name={name} schema={schema} treeStore={this.treeStore} {...props} />
      </ThemeZone>
    );
  }
}

import { TreeStore } from '@stoplight/tree-list';
import { Omit } from '@stoplight/types';
import { runInAction } from 'mobx';
import * as React from 'react';
import { ThemeZone } from '../theme';
import { isSchemaViewerEmpty, renderSchema } from '../utils';
import { ErrorMessage } from './common/ErrorMessage';
import { MutedText } from './common/MutedText';
import { ISchemaTree, SchemaTree } from './SchemaTree';

export interface IJsonSchemaViewer extends Omit<ISchemaTree, 'emptyText' | 'treeStore'> {
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
      nodes: Array.from(renderSchema(props.dereferencedSchema || props.schema, 0, { path: [] }, { mergeAllOf: true })),
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
        <SchemaTree expanded={expanded} name={name} schema={schema} treeStore={this.treeStore} {...props} />
      </ThemeZone>
    );
  }
}

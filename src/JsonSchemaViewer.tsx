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

export interface IJsonSchemaViewer extends Omit<ISchemaView, 'emptyText'> {
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
      defaultExpandedDepth: this.props.defaultExpandedDepth === undefined ? 1 : this.props.defaultExpandedDepth,
      nodes: () => Array.from(renderSchema(this.props.schema, this.props.dereferencedSchema, this.treeStore)),
    });
  }

  // there is no error hook yet, see https://reactjs.org/docs/hooks-faq.html#how-do-lifecycle-methods-correspond-to-hooks
  public static getDerivedStateFromError(error: Error): { error: IJsonSchemaViewerState['error'] } {
    return { error: `Error rendering schema. ${error.message}` };
  }

  public componentDidUpdate(prevProps: Readonly<IJsonSchemaViewer>) {
    if (prevProps.defaultExpandedDepth !== this.props.defaultExpandedDepth) {
      this.setExpandedDepth(this.props.defaultExpandedDepth);
    }
  }

  @action
  protected setExpandedDepth(depth?: number) {
    this.treeStore.defaultExpandedDepth = depth === undefined ? 1 : depth;
  }

  public render() {
    const {
      props: {
        emptyText = 'No schema defined',
        name,
        schema,
        schemas,
        limitPropertyCount,
        expanded,
        defaultExpandedDepth,
        ...props
      },
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
        <SchemaView
          expanded={expanded}
          name={name}
          schema={schema}
          treeStore={this.treeStore}
          {...props}
        />
      </ThemeZone>
    );
  }
}

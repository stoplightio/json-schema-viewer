import { Omit } from '@stoplight/types';
import * as React from 'react';
import { ErrorMessage } from './common/ErrorMessage';
import { MutedText } from './common/MutedText';
import { ISchemaView, SchemaView } from './SchemaView';
import { ThemeZone } from './theme';
import { isSchemaViewerEmpty } from './util/isSchemaViewerEmpty';

export interface IJsonSchemaViewer extends Omit<ISchemaView, 'emptyText'> {
  emptyText?: string;
}

export interface IJsonSchemaViewerState {
  error: null | string;
}

export class JsonSchemaViewer extends React.PureComponent<IJsonSchemaViewer, IJsonSchemaViewerState> {
  public state = {
    error: null,
  };

  // there is no error hook yet, see https://reactjs.org/docs/hooks-faq.html#how-do-lifecycle-methods-correspond-to-hooks
  public static getDerivedStateFromError(error: Error): { error: IJsonSchemaViewerState['error'] } {
    return { error: `Error rendering schema. ${error.message}` };
  }

  public render() {
    const {
      props: {
        emptyText = 'No schema defined',
        name,
        schema,
        schemas,
        limitPropertyCount,
        hideRoot,
        expanded,
        defaultExpandedDepth,
        hideInheritedFrom,
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
          emptyText={emptyText}
          defaultExpandedDepth={defaultExpandedDepth}
          expanded={expanded}
          hideInheritedFrom={hideInheritedFrom}
          hideRoot={hideRoot}
          limitPropertyCount={limitPropertyCount}
          name={name}
          schema={schema}
          {...props}
        />
      </ThemeZone>
    );
  }
}

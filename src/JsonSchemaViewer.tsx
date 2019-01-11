/* @jsx jsx */

import { jsx } from '@emotion/core';
import { Box, IBox } from '@stoplight/ui-kit';
import { Component } from 'react';
import { ErrorMessage } from './common/ErrorMessage';
import { MutedText } from './common/MutedText';
import { ISchemaView, SchemaView } from './Schema';
import { isSchemaViewerEmpty } from './util/isSchemaViewerEmpty';

export interface IJsonSchemaViewer extends ISchemaView, IBox {}

export interface IJsonSchemaViewerState {
  error: null | string;
}

export class JsonSchemaViewer extends Component<IJsonSchemaViewer, IJsonSchemaViewerState> {
  public state = {
    error: null,
  };

  // there is no error hook yet, see https://reactjs.org/docs/hooks-faq.html#how-do-lifecycle-methods-correspond-to-hooks
  public static getDerivedStateFromError(error: Error): { error: IJsonSchemaViewerState['error'] } {
    return { error: error.message };
  }

  public render() {
    const {
      props: {
        name,
        schema,
        dereferencedSchema,
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
      // todo: handle these:
      /*
      <Box as="p" p={3} className="u-error">
        There is an error in your {name} schema definition.
      </Box>
      */

      /*<Row className="u-error">{`Error rendering schema. ${e}`}</Row>]*/
      return <ErrorMessage>{error}</ErrorMessage>;
    }

    // an empty array or object is still a valid response, schema is ONLY really empty when a combiner type has no information
    if (isSchemaViewerEmpty(schema)) {
      return <MutedText>No schema defined</MutedText>;
    }

    return (
      <Box {...props}>
        {(
          <SchemaView
            defaultExpandedDepth={defaultExpandedDepth}
            dereferencedSchema={dereferencedSchema}
            expanded={expanded}
            hideInheritedFrom={hideInheritedFrom}
            hideRoot={hideRoot}
            limitPropertyCount={limitPropertyCount}
            name={name}
            schema={schema}
            schemas={schemas}
          />
        ) || <MutedText>No schema defined</MutedText>}
      </Box>
    );
  }
}

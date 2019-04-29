import { Dialog } from '@stoplight/ui-kit';
import * as React from 'react';
import { IJsonSchemaViewer, JsonSchemaViewer } from './';

export interface IMaskedSchema extends IJsonSchemaViewer {
  onClose(): void;
}

export const MaskedSchema: React.FunctionComponent<IMaskedSchema> = ({ onClose, ...props }) => {
  return (
    <Dialog isOpen={true} onClose={onClose}>
      <JsonSchemaViewer {...props} style={{ height: 500 }} canSelect />
    </Dialog>
  );
};

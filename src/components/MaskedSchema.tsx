import { Dialog } from '@stoplight/ui-kit';
import * as React from 'react';
import { IJsonSchemaViewer, JsonSchemaViewer } from '../JsonSchemaViewer';

export interface IMaskedSchema extends IJsonSchemaViewer {
  onClose(): void;
}

export const MaskedSchema: React.FunctionComponent<IMaskedSchema> = ({ onClose, ...props }) => {
  return (
    <Dialog show onClickOutside={onClose} width="50vh" height="50vh" position="relative">
      <JsonSchemaViewer {...props} canSelect />
    </Dialog>
  );
};

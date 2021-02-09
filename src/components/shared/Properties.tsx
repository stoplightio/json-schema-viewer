import { Text } from '@stoplight/mosaic';
import { Dictionary } from '@stoplight/types';
import * as React from 'react';

import { ViewModeContext } from '../../contexts';

export interface IProperties {
  required: boolean;
  deprecated: boolean;
  validations: Dictionary<unknown>;
}

export const Properties: React.FunctionComponent<IProperties> = ({
  required,
  deprecated,
  validations: { readOnly, writeOnly },
}) => {
  const viewMode = React.useContext(ViewModeContext);

  // Show readOnly writeOnly validations only in standalone mode and only if just one of them is present
  const showVisibilityValidations = viewMode === 'standalone' && !!readOnly !== !!writeOnly;
  const visibility = showVisibilityValidations ? (
    readOnly ? (
      <Text ml={2} color="muted">
        read-only
      </Text>
    ) : (
      <Text ml={2} color="muted">
        write-only
      </Text>
    )
  ) : null;

  return (
    <>
      {deprecated ? (
        <Text ml={2} color="warning">
          deprecated
        </Text>
      ) : null}
      {visibility}
      {required && (
        <Text ml={2} color="warning">
          required
        </Text>
      )}
    </>
  );
};

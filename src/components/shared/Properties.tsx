import { Dictionary } from '@stoplight/types';
import * as React from 'react';

import { useJSVOptionsContext } from '../../contexts';

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
  const { viewMode } = useJSVOptionsContext();

  // Show readOnly writeOnly validations only in standalone mode and only if just one of them is present
  const showVisibilityValidations = viewMode === 'standalone' && !!readOnly !== !!writeOnly;
  const visibility = showVisibilityValidations ? (
    readOnly ? (
      <span className="sl-ml-2 sl-text-muted">
        read-only
      </span>
    ) : (
      <span className="sl-ml-2 sl-text-muted">
        write-only
      </span>
    )
  ) : null;

  return (
    <>
      {deprecated ? (
        <span className="sl-ml-2 sl-text-warning">
          deprecated
        </span>
      ) : null}
      {visibility}
      {required && (
        <span className="sl-ml-2 sl-text-warning">
          required
        </span>
      )}
    </>
  );
};

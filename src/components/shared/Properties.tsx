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
      <span className="ml-2 text-darken-7 dark:text-lighten-6">read-only</span>
    ) : (
      <span className="ml-2 text-darken-7 dark:text-lighten-6">write-only</span>
    )
  ) : null;

  return (
    <>
      {deprecated ? <span className="ml-2 text-orange-7 dark:text-orange-6">deprecated</span> : null}
      {visibility}
      {required && <span className="ml-2 text-orange-7 dark:text-orange-6">required</span>}
    </>
  );
};

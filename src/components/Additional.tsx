import { safeStringify } from '@stoplight/json';
import { Box, Flex, Popup, Tooltip } from '@stoplight/ui-kit';
import * as React from 'react';
import { ITreeNodeMeta } from '../types';

export const Additional: React.FunctionComponent<Pick<ITreeNodeMeta, 'additional'>> = ({ additional }) => {
  const trigger = (
    <Box fontSize="0.75rem" ml={6}>
      accepts additional
    </Box>
  );

  if (typeof additional === 'boolean') {
    return trigger;
  }

  const content = React.useMemo(() => safeStringify(additional, undefined, 2), [additional]);

  return (
    <Popup
      posX="left"
      posY="center"
      padding={2}
      renderTrigger={() => trigger}
      renderContent={() => (
        <Tooltip posX="left" posY="center">
          <Flex flexFlow="column nowrap">{content}</Flex>
        </Tooltip>
      )}
    />
  );
};

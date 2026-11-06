import { Flex, Icon } from '@stoplight/mosaic';
import * as React from 'react';

import { CARET_ICON_SIZE } from '../../consts';

export interface ICaret {
  isExpanded: boolean;
}

export const Caret: React.FunctionComponent<ICaret> = ({ isExpanded }) => (
  <Flex pl={3} w={8} ml={-8} color="muted" role="button" justifyContent="center" aria-label={isExpanded ? `Collapse button` : `Expand button`} aria-expanded={isExpanded}>
    <Icon size={CARET_ICON_SIZE} fixedWidth icon={isExpanded ? 'chevron-down' : 'chevron-right'} />
  </Flex>
);

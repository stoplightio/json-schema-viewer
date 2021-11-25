import { Flex, Icon, WidthVals } from '@stoplight/mosaic';
import * as React from 'react';

import { CARET_ICON_SIZE, CARET_OFFSET } from '../../consts';

export interface ICaret {
  isExpanded: boolean;
}

export const Caret: React.FunctionComponent<ICaret> = ({ isExpanded }) => (
  <Flex pl={3} w={9} ml={-9} color="light" role="button" justifyContent="center">
    <Icon size={CARET_ICON_SIZE} icon={isExpanded ? 'chevron-down' : 'chevron-right'} />
  </Flex>
);

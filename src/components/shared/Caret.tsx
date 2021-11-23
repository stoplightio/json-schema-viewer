import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown.js';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight.js';
import { Flex, Icon } from '@stoplight/mosaic';
import * as React from 'react';

import { CARET_ICON_BOX_DIMENSION, CARET_ICON_SIZE, CARET_OFFSET } from '../../consts';

export interface ICaret {
  isExpanded: boolean;
}

export const Caret: React.FunctionComponent<ICaret> = ({ isExpanded }) => (
  <Flex
    pos="absolute"
    left={CARET_OFFSET}
    alignItems="center"
    justifyItems="center"
    cursor="pointer"
    color="muted"
    mt={0.5}
    h={CARET_ICON_BOX_DIMENSION}
    role="button"
  >
    <Icon size={CARET_ICON_SIZE} icon={isExpanded ? faChevronDown : faChevronRight} />
  </Flex>
);

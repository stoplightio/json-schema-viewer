import {faChevronDown, faChevronRight} from '@fortawesome/free-solid-svg-icons';
import { Flex, Icon, IIconProps } from '@stoplight/mosaic';
import * as React from 'react';

export interface ICaret {
  isExpanded: boolean;
  style?: React.CSSProperties;
  size?: IIconProps['size'];
}

export const Caret: React.FunctionComponent<ICaret> = ({ style, size, isExpanded }) => (
  <Flex
    pos="absolute"
    justify="center"
    p={1}
    cursor="pointer"
    role="button"
    style={style}
    color="muted"
  >
    <Icon
      size={size}
      icon={isExpanded ? faChevronDown : faChevronRight}
    />
  </Flex>
);

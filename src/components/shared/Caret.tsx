import { Icon, IIconProps } from '@stoplight/mosaic';
import * as React from 'react';

export interface ICaret {
  isExpanded: boolean;
  style?: React.CSSProperties;
  size?: IIconProps['size'];
}

export const Caret: React.FunctionComponent<ICaret> = ({ style, size, isExpanded }) => (
  <span
    className="absolute flex justify-center cursor-pointer p-1"
    role="button"
    style={style}
  >
    <Icon
      iconSize={size}
      icon={['fas', isExpanded ? 'chevron-down' : 'chevron-right']}
      className="text-darken-9 dark:text-lighten-7"
    />
  </span>
);

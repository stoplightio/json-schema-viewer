import { Icon, IIconProps } from '@stoplight/ui-kit';
import * as React from 'react';

export interface ICaret {
  isExpanded: boolean;
  style?: React.CSSProperties;
  size?: IIconProps['iconSize'];
}

export const Caret: React.FunctionComponent<ICaret> = ({ style, size, isExpanded }) => (
  <span
    className="absolute flex justify-center cursor-pointer p-1 rounded hover:bg-darken-3"
    role="button"
    style={style}
  >
    <Icon
      iconSize={size}
      icon={isExpanded ? 'caret-down' : 'caret-right'}
      className="text-darken-9 dark:text-lighten-9"
    />
  </span>
);

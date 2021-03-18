import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon, IIconProps } from '@stoplight/mosaic';
import * as React from 'react';

export interface ICaret {
  isExpanded: boolean;
  style?: React.CSSProperties;
  size?: IIconProps['size'];
}

export const Caret: React.FunctionComponent<ICaret> = ({ style, size, isExpanded }) => (
  <div
    className="sl-flex sl-absolute sl-justify-center sl-p-1 sl-cursor-pointer sl-text-muted"
    role="button"
    style={style}
  >
    <Icon size={size} icon={isExpanded ? faChevronDown : faChevronRight} />
  </div>
);

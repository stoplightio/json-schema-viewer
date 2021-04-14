import { faChevronDown, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@stoplight/mosaic';
import * as React from 'react';

import { CARET_ICON_BOX_DIMENSION, CARET_ICON_SIZE, CARET_OFFSET } from '../../consts';

export interface ICaret {
  isExpanded: boolean;
}

const caretStyle = {
  height: CARET_ICON_BOX_DIMENSION,
  left: -CARET_OFFSET,
};

export const Caret: React.FunctionComponent<ICaret> = ({ isExpanded }) => (
  <div
    className="sl-flex sl-absolute sl-justify-center sl-items-center sl-cursor-pointer sl-text-muted"
    style={caretStyle}
    role="button"
  >
    <Icon size={CARET_ICON_SIZE} icon={isExpanded ? faChevronDown : faChevronRight} />
  </div>
);

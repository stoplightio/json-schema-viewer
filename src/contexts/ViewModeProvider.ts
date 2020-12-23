import * as React from 'react';

import { ViewMode as ViewModeKind } from '../types';

export const ViewModeContext = React.createContext<ViewModeKind>('standalone');

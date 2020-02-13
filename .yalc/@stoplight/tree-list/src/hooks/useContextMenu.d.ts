import * as React from 'react';
import { TreeListContextMenuGenerator } from '../types';
export declare const useContextMenu: (node: import("../types").ITreeListNode | import("../types").ITreeListNodeWithChildren | null, generateContextMenu?: TreeListContextMenuGenerator | undefined) => (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;

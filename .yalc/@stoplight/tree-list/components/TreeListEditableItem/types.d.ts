import * as React from 'react';
import { TreeListNode } from '../../types';
export interface ITreeListEditableItem extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'placeholder'> {
    node: TreeListNode;
}

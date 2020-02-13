import * as React from 'react';
import { TreeListNode } from 'src/types';
export interface ITreeListEditableItem extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'placeholder'> {
    node: TreeListNode;
}

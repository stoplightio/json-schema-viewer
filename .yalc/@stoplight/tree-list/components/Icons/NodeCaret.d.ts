import * as React from 'react';
import { IconStore, TreeListNode } from '../../types';
export interface INodeCaret extends React.HTMLAttributes<HTMLDivElement> {
    expanded?: boolean;
    icons: IconStore;
    node: TreeListNode;
}
export declare const NodeCaret: React.FunctionComponent<INodeCaret>;

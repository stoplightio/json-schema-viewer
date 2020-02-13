import { TreeStore } from '../store';
import { ITreeListContextMenuItem, TreeListNode } from '../types';
export declare const generateContextMenu: (store: TreeStore) => (node: TreeListNode) => ITreeListContextMenuItem[];

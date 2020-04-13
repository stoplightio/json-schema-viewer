/// <reference types="react" />
import { TreeListEvents, TreeListNode } from '../types';
export declare const useNodeCallback: <E extends HTMLElement = HTMLElement>(event: TreeListEvents.NodeClick | TreeListEvents.NodeMouseEnter | TreeListEvents.NodeMouseLeave | TreeListEvents.NodeCaretClick, node: import("../types").ITreeListNode<unknown> | import("../types").ITreeListNodeWithChildren<unknown, TreeListNode<unknown>> | null) => (event: import("react").MouseEvent<E, MouseEvent>) => void;

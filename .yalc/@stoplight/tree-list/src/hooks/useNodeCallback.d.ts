/// <reference types="react" />
import { TreeListEvents } from '../types';
export declare const useNodeCallback: <E extends HTMLElement = HTMLElement>(event: TreeListEvents.NodeClick | TreeListEvents.NodeMouseEnter | TreeListEvents.NodeMouseLeave | TreeListEvents.NodeCaretClick, node: import("../types").ITreeListNode | import("../types").ITreeListNodeWithChildren | null) => (event: import("react").MouseEvent<E, MouseEvent>) => void;

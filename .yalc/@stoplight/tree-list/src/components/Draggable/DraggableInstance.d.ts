/// <reference types="node" />
import { TreeListNode, TreeListParentNode } from 'src/types';
import { Ghost } from './Ghost';
import { Highlighter } from './Highlighter';
export declare class DraggableInstance {
    currentDragZone?: TreeListParentNode;
    initialDragZone?: TreeListParentNode;
    initialNode?: TreeListNode;
    collapseTimeout?: number | void | NodeJS.Timer;
    highlighter: Highlighter;
    ghost: Ghost;
    id: number;
    dropPermissions: Map<string, boolean>;
    private static seed;
    constructor();
    clear(): void;
}

import { Dictionary } from '@stoplight/types';
export interface ITreeState {
    expanded?: Dictionary<boolean>;
    activeNodeId?: string | null;
    editedNodeId?: string | null;
}
export declare class TreeState implements ITreeState {
    constructor(state?: ITreeState);
    expanded: Dictionary<boolean>;
    activeNodeId: string | null;
    editedNodeId: string | null;
}

import type { SchemaFragment } from '../types';
import { BaseNode } from './BaseNode';
export declare class ReferenceNode extends BaseNode {
    readonly error: string | null;
    readonly value: string | null;
    constructor(fragment: SchemaFragment, error: string | null);
    toJSON(): SchemaFragment;
    get external(): boolean;
    static [Symbol.hasInstance](instance: unknown): boolean;
}

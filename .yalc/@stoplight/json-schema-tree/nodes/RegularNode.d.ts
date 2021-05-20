import type { Dictionary } from '@stoplight/types';
import type { SchemaDialect } from '../dialects/SchemaDialect';
import type { SchemaFragment } from '../types';
import { BaseNode } from './BaseNode';
import type { ReferenceNode } from './ReferenceNode';
import { MirroredSchemaNode, SchemaCombinerName, SchemaNodeKind } from './types';
export declare class RegularNode extends BaseNode {
    readonly fragment: SchemaFragment;
    readonly dialect: SchemaDialect;
    readonly $id: string;
    readonly types: Set<SchemaNodeKind>;
    readonly combiners: Set<SchemaCombinerName>;
    readonly enum: Set<unknown>;
    format: string | null;
    title: string | null;
    children: (RegularNode | ReferenceNode | MirroredSchemaNode)[] | null | undefined;
    readonly annotations: Record<string, unknown>;
    constructor(fragment: SchemaFragment, dialect: SchemaDialect);
    toJSON(): SchemaFragment;
    get validations(): Dictionary<unknown>;
    get primaryType(): SchemaNodeKind | null;
    get simple(): boolean;
    get unknown(): boolean;
    static [Symbol.hasInstance](instance: unknown): boolean;
}

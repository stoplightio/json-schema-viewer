import type { SchemaCombinerName, SchemaNodeKind } from '../../nodes';
import type { SchemaFragment } from '../../types';
import { SchemaDialect } from '../SchemaDialect';
export declare class SharedSchemaDialect extends SchemaDialect {
    readonly id = "shared";
    getCombiners(_fragment: SchemaFragment): Set<SchemaCombinerName>;
    getAnnotations(fragment: SchemaFragment): Record<string, unknown>;
    getValidations(fragment: SchemaFragment, types: Set<SchemaNodeKind>): Record<string, unknown>;
}

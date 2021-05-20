import type { SchemaCombinerName, SchemaNodeKind } from '../../nodes';
import type { SchemaFragment } from '../../types';
import { SharedSchemaDialect } from '../Base/SharedDialect';
export declare class JSONSchemaDraft7Dialect extends SharedSchemaDialect {
    getCombiners(fragment: SchemaFragment): Set<SchemaCombinerName>;
    getAnnotations(fragment: SchemaFragment): Record<string, unknown>;
    getValidations(fragment: SchemaFragment, types: Set<SchemaNodeKind>): Record<string, unknown>;
}

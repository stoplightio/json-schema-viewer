import type { SchemaNodeKind } from '../../../nodes';
import type { SchemaFragment } from '../../../types';
export declare function getValidations(schema: SchemaFragment, types: Set<SchemaNodeKind>): Record<string, unknown>;

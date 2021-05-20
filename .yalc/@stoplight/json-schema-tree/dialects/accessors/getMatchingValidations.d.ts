import type { SchemaNodeKind } from '../../nodes/types';
import type { SchemaFragment } from '../../types';
import type { Validations } from '../types';
export declare function getMatchingValidations(fragment: SchemaFragment, validations: Validations, types: Set<SchemaNodeKind>): Record<string, unknown>;

import type { Dictionary } from '@stoplight/types';
import type { SchemaNodeKind } from '../../../nodes/types';
import type { SchemaFragment } from '../../../types';
export declare function getValidations(fragment: SchemaFragment, types: Set<SchemaNodeKind>): Dictionary<unknown>;

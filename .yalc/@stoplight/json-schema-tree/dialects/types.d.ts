import type { SchemaNodeKind } from '../nodes/types';
export declare type Validator = {
    key: string;
    value(input: unknown): boolean;
};
export declare type Validations = Partial<Record<SchemaNodeKind, Validator[]>>;

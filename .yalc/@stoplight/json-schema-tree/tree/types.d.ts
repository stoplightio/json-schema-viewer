import type { SchemaDialect } from '../dialects/SchemaDialect';
import type { SchemaFragment } from '../types';
export declare type SchemaTreeOptions = {
    mergeAllOf: boolean;
    refResolver: SchemaTreeRefDereferenceFn | null;
    dialect: SchemaDialect;
};
export declare type SchemaTreeRefInfo = {
    source: string | null;
    pointer: string | null;
};
export declare type SchemaTreeRefDereferenceFn = (ref: SchemaTreeRefInfo, propertyPath: string[] | null, schema: SchemaFragment) => SchemaFragment;

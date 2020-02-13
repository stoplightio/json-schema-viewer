export declare class IndexLookup<T extends object> {
    protected size: number;
    head: number;
    tail: number;
    protected readonly cache: Map<number, T>;
    constructor(size: number);
    set(pos: number, item: T): void;
    get(pos: number): T | undefined;
    clear(pos: number): void;
}

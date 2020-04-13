declare type SwappableCollection<C = typeof WeakSet | typeof WeakMap> = C & {
    swap(): void;
};
export declare function createSwappableWeakCollection<K extends object, V>(collection: WeakMapConstructor): SwappableCollection<WeakMap<K, V>>;
export declare function createSwappableWeakCollection<K extends object>(collection: WeakSetConstructor): SwappableCollection<WeakSet<K>>;
export {};

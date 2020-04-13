import { TreeListParentNode } from '../../types';
export declare class Highlighter {
    private rootZoneId;
    protected cache: WeakMap<TreeListParentNode<unknown>, HTMLStyleElement>;
    protected genericStyle?: HTMLStyleElement;
    constructor(rootZoneId: number);
    setGenericStyles(): void;
    clearGenericStyles(): void;
    setRange(node: TreeListParentNode): void;
    clearRange(node: TreeListParentNode): void;
    protected static generateStyles(selector: string, styles: Partial<CSSStyleDeclaration>): string;
}

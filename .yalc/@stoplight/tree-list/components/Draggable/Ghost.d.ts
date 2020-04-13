import { DragEvent } from 'react';
export declare class Ghost {
    protected readonly node: HTMLSpanElement | null;
    constructor();
    get content(): string | null;
    set content(text: string | null);
    attach: (e: DragEvent<Element>) => void;
    detach: () => void;
}

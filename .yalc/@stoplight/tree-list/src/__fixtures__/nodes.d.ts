export declare const smallList: () => ({
    id: string;
    level: number;
    name: string;
    type: string;
    canHaveChildren?: undefined;
} | {
    id: string;
    level: number;
    name: string;
    type: string;
    canHaveChildren: boolean;
})[];
export declare const largeList: () => any[];
export declare const stressList: () => {
    id: string;
    name: string;
    level: number;
    type: string;
}[];

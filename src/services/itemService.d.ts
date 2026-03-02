export declare function createItem(name?: string): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    currentHash: string | null;
}>;
export declare function getItem(id: string): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    currentHash: string | null;
} | null>;
export declare function listItems(): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    currentHash: string | null;
}[]>;
export declare function updateItemCurrentHash(id: string, currentHash: string): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    currentHash: string | null;
}>;
export declare function deleteItem(id: string): Promise<{
    name: string | null;
    id: string;
    createdAt: Date;
    currentHash: string | null;
}>;
//# sourceMappingURL=itemService.d.ts.map
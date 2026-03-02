export interface FreezeCreateData {
    type: string;
    svg: string;
    metadata: string;
    parentHash?: string | null;
    hash: string;
}
export declare function createFreeze(itemId: string, data: FreezeCreateData): Promise<{
    type: string;
    svg: string;
    metadata: string;
    parentHash: string | null;
    hash: string;
    itemId: string;
    id: string;
    createdAt: Date;
}>;
export declare function getLatestFreeze(itemId: string): Promise<{
    type: string;
    svg: string;
    metadata: string;
    parentHash: string | null;
    hash: string;
    itemId: string;
    id: string;
    createdAt: Date;
} | null>;
export declare function listFreezes(itemId: string): Promise<{
    type: string;
    svg: string;
    metadata: string;
    parentHash: string | null;
    hash: string;
    itemId: string;
    id: string;
    createdAt: Date;
}[]>;
export interface FreezeCursorPaginationInput {
    itemId: string;
    cursor?: string;
    limit: number;
}
export declare function listFreezesPaginated(input: FreezeCursorPaginationInput): Promise<{
    freezes: {
        type: string;
        svg: string;
        metadata: string;
        parentHash: string | null;
        hash: string;
        itemId: string;
        id: string;
        createdAt: Date;
    }[];
    nextCursor: string | null;
}>;
//# sourceMappingURL=freezeService.d.ts.map
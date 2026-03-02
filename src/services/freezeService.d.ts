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
    id: string;
    createdAt: Date;
    itemId: string;
}>;
export declare function getLatestFreeze(itemId: string): Promise<{
    type: string;
    svg: string;
    metadata: string;
    parentHash: string | null;
    hash: string;
    id: string;
    createdAt: Date;
    itemId: string;
} | null>;
export declare function listFreezes(itemId: string): Promise<{
    type: string;
    svg: string;
    metadata: string;
    parentHash: string | null;
    hash: string;
    id: string;
    createdAt: Date;
    itemId: string;
}[]>;
//# sourceMappingURL=freezeService.d.ts.map
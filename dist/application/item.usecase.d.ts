type ItemStatus = 'ACTIVE' | 'FROZEN' | 'EMPTY';
export interface CreateItemUseCaseInput {
    ownerId: string;
    name?: string;
}
export declare function createItem(input: CreateItemUseCaseInput): Promise<{
    name: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    sellerId: string | null;
    ownerId: string;
    id: string;
    title: string | null;
    description: string | null;
    category: string | null;
    price: number | null;
    previewUrl: string | null;
    deliveryType: string | null;
    originalityStatus: string;
    version: number;
    currentHash: string | null;
    createdAt: Date;
    brandId: string | null;
    collaborationId: string | null;
}>;
export declare function getItemWithFreezes(id: string): Promise<{
    name: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    sellerId: string | null;
    ownerId: string;
    id: string;
    title: string | null;
    description: string | null;
    category: string | null;
    price: number | null;
    previewUrl: string | null;
    deliveryType: string | null;
    originalityStatus: string;
    version: number;
    currentHash: string | null;
    createdAt: Date;
    brandId: string | null;
    collaborationId: string | null;
} | null>;
export interface ListItemsInput {
    ownerId: string;
    cursor?: string;
    limit: number;
}
export declare function getItemsPage(input: ListItemsInput): Promise<{
    items: {
        name: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        sellerId: string | null;
        ownerId: string;
        id: string;
        title: string | null;
        description: string | null;
        category: string | null;
        price: number | null;
        previewUrl: string | null;
        deliveryType: string | null;
        originalityStatus: string;
        version: number;
        currentHash: string | null;
        createdAt: Date;
        brandId: string | null;
        collaborationId: string | null;
    }[];
    nextCursor: string | null;
}>;
export declare function renameItem(id: string, version: number, name?: string): Promise<{
    name: string | null;
    metadata: import("@prisma/client/runtime/library").JsonValue | null;
    sellerId: string | null;
    ownerId: string;
    id: string;
    title: string | null;
    description: string | null;
    category: string | null;
    price: number | null;
    previewUrl: string | null;
    deliveryType: string | null;
    originalityStatus: string;
    version: number;
    currentHash: string | null;
    createdAt: Date;
    brandId: string | null;
    collaborationId: string | null;
}>;
export declare function getItemFull(id: string): Promise<{
    id: string;
    name: string | null;
    currentHash: string | null;
    status: ItemStatus;
    freezes: {
        id: string;
        type: string;
        hash: string;
        parentHash: string | null;
        metadata: Record<string, unknown>;
    }[];
} | null>;
export {};
//# sourceMappingURL=item.usecase.d.ts.map
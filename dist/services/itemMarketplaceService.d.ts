import { Prisma } from '@prisma/client';
export interface CreateMarketplaceItemInput {
    sellerId: string;
    title: string;
    description: string;
    category: string;
    price: number;
    previewUrl: string;
    deliveryType: string;
    metadata: Prisma.InputJsonValue;
    brandId?: string;
    collaborationId?: string;
    originalityStatus?: 'SELF_DECLARED' | 'VERIFIED' | 'FLAGGED';
}
export declare function createMarketplaceItem(input: CreateMarketplaceItemInput): Promise<{
    name: string | null;
    metadata: Prisma.JsonValue | null;
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
export declare function addTagsToItem(itemId: string, tagNames: string[]): Promise<({
    tags: ({
        tag: {
            name: string;
            id: string;
        };
    } & {
        itemId: string;
        tagId: string;
    })[];
} & {
    name: string | null;
    metadata: Prisma.JsonValue | null;
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
}) | null>;
//# sourceMappingURL=itemMarketplaceService.d.ts.map
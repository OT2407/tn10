export declare function getItemWithFreezesForVerification(itemId: string): Promise<{
    item: {
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
    };
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
} | null>;
//# sourceMappingURL=verifierService.d.ts.map
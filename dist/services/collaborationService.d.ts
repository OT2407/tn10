export declare function createCollaboration(title: string, description: string): Promise<{
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    status: string;
}>;
export declare function addMember(collaborationId: string, userId: string, percentage: number, role: string): Promise<{
    userId: string;
    id: string;
    collaborationId: string;
    percentage: number;
    role: string;
}>;
export declare function publishCollaboration(collaborationId: string): Promise<{
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    status: string;
}>;
export declare function attachItemToCollaboration(itemId: string, collaborationId: string): Promise<{
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
//# sourceMappingURL=collaborationService.d.ts.map